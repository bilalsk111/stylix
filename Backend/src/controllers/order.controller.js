import crypto from "crypto";
import { config } from "../config/config.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import { getCartDetail } from "../dao/cart.dao.js";
import { createOrderservice } from "../services/payment.service.js";

export const getAllOrdersAdmin = async (req, res) => {
  try {
    // Find all orders, populate user details and product details
    // .sort({ createdAt: -1 }) ensures newest orders show up first
    const orders = await orderModel.find()
      .populate("user", "fullname email contact") // User collection se ye fields aayengi
      .populate("items.product", "title images price") // Product collection se ye aayega
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params; // Order ID URL se aayegi
    const { orderStatus } = req.body;

    // Strict Validation: Kachra status allow mat karo
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status provided." });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Update the status
    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or already deleted." });
    }

    return res.status(200).json({
      success: true,
      message: "Order permanently deleted.",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Added .lean() for faster execution since these are read-only documents
    const orders = await orderModel.find({ user: userId })
      .populate("items.product", "title images price") 
      .sort({ createdAt: -1 })
      .lean(); 

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Single Atomic Query: Finds order for this specific user that is STILL processing, and updates it.
    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, user: userId, orderStatus: "Processing" },
      { $set: { orderStatus: "Cancelled" } },
      { new: true }
    );

    // If update fails, determine the exact reason to send a clear error message
    if (!updatedOrder) {
      const existingOrder = await orderModel.findById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      if (existingOrder.user.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized action" });
      }
      return res.status(400).json({
        success: false,
        message: `You cannot cancel an order that is already ${existingOrder.orderStatus}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order has been cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { isBuyNow, singleItem, items, shippingAddress } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 1. VERIFY STOCK ONLY (DO NOT DEDUCT HERE)
    for (const item of items) {
      const product = await productModel.findOne({
        _id: item.productId,
        "variants._id": item.variantId,
        "variants.stock": { $gte: item.quantity },
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Transaction Aborted: One or more items are out of stock.",
        });
      }
    }

    let totalAmount = 0;

    if (isBuyNow && singleItem) {
      const product = await productModel.findById(singleItem.productId);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      const variant = product.variants.id(singleItem.variantId);
      if (!variant)
        return res
          .status(404)
          .json({ success: false, message: "Variant not found" });

      totalAmount = variant.price.amount * singleItem.quantity;
    } else {
      const cartDetails = await getCartDetail(userId);
      if (!cartDetails || cartDetails.totalPrice === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }
      totalAmount = cartDetails.totalPrice;
    }

    const shippingFee = totalAmount >= 2000 ? 0 : 150;
    const finalAmountToPay = totalAmount + shippingFee;

    // 2. Generate Razorpay Order
    const rzpOrder = await createOrderservice({
      amount: finalAmountToPay,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 3. Create Pending Order in DB
    const newOrder = new orderModel({
      user: userId,
      totalAmount: finalAmountToPay,
      paymentStatus: "Pending",
      orderStatus: "Processing",
      items: items.map((item) => ({
        product: item.productId,
        variant: item.variantId,
        quantity: item.quantity,
        price: {
          amount: item.price.amount,
          currency: item.price.currency,
        },
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      paymentInfo: {
        razorpay_order_id: rzpOrder.id,
      },
    });

    await newOrder.save();

    return res.status(200).json({
      success: true,
      message: "Order initiated",
      order: rzpOrder,
      dbOrderId: newOrder._id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      isBuyNow,
    } = req.body;
    const userId = req.user._id;

    const order = await orderModel.findById(dbOrderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found in database" });
    if (order.paymentStatus === "Paid")
      return res.status(200).json({ message: "Already processed" });

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "Failed";
      await order.save();
      return res
        .status(400)
        .json({ success: false, message: "Payment Verification Failed!" });
    }

    // 2. Mark as Paid
    order.paymentStatus = "Paid";
    order.paymentInfo.razorpay_payment_id = razorpay_payment_id;
    order.paymentInfo.razorpay_signature = razorpay_signature;
    await order.save();

    // 3. DEDUCT STOCK ATOMICALLY (ONLY ONCE)
    for (const item of order.items) {
      await productModel.updateOne(
        { _id: item.product, "variants._id": item.variant },
        { $inc: { "variants.$.stock": -item.quantity } },
      );
    }

    // 4. Clear Cart if it wasn't a direct buy
    if (!isBuyNow) {
      await cartModel.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and Order placed successfully!",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Signature Verify karo (Hacker check)
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(403).json({ message: "Invalid Signature." });
    }

    // 2. Agar payment Successful hai
    if (req.body.event === "payment.captured") {
      const razorpayOrderId = req.body.payload.payment.entity.order_id;

      // DB mein order dhundho (Make sure Order/orderModel is correct based on your imports)
      const order = await orderModel.findOne({
        "paymentInfo.razorpay_order_id": razorpayOrderId,
      });
      if (!order || order.paymentStatus === "Paid")
        return res.status(200).send("Already processed");

      let stockDeductedSuccessfully = true;

      // 3.  YAHAN HOGA ATOMIC UPDATE (STOCK MINUS) 🔥
      for (const item of order.items) {
        const result = await productModel.updateOne(
          {
            _id: item.product,
            "variants._id": item.variant,
            "variants.stock": { $gte: item.quantity },
          },
          {
            $inc: { "variants.$.stock": -item.quantity },
          },
        );

        // Agar kisi bhi item ka stock minus fail hua
        if (result.modifiedCount === 0) {
          stockDeductedSuccessfully = false;
          break;
        }
      }

      // 4. Overbooking Handler
      if (!stockDeductedSuccessfully) {
        order.paymentStatus = "Paid - Out of Stock";
        order.orderStatus = "Cancelled";
        await order.save();

        // Razorpay Refund Logic will go here in the future
        return res.status(200).send("Out of stock, auto-refund initiated");
      }

      // 5. Stock minus ho gaya, order confirm kar do!
      order.paymentStatus = "Paid";
      await order.save();

      return res.status(200).send("Order Confirmed & Stock Updated");
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).send("Server Error");
  }
};
