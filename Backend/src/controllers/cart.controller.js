import mongoose from "mongoose";
import crypto from "crypto"; // 🔥 YE MISSING THA! Iske bina verifyPayment fat jayega.
import { config } from "../config/config.js"; // 🔥 YE BHI MISSING THA! Signature check ke liye.
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { createOrderservice } from "../services/payment.service.js"; // 🔥 Ensure Capital 'S' here if you fixed it earlier.
import orderModel from "../models/order.model.js";
import { getCartDetail } from "../dao/cart.dao.js";


export const addtocart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;

    // 1. Product ko DB se nikal lo
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    // 2. 🔥 SMART LOGIC: Product ke andar se exact variant dhundho
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId,
    );
    if (!variant) {
      return res
        .status(404)
        .json({ message: "Variant not found", success: false });
    }

    // 3. Stock direct variant se check karo (Fast & Safe)
    const stock = variant.stock || 0;
    if (stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock, only ${stock} left`,
        success: false,
      });
    }

    // 4. Cart dhundho ya naya banao
    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    // 5. Check karo kya ye (product + variant) combination cart mein already hai
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    );

    if (existingItem) {
      // Agar already hai, toh max stock exceed na ho
      if (existingItem.quantity + quantity > stock) {
        return res.status(400).json({
          message: `Only ${stock} items in stock. You already have ${existingItem.quantity} in cart.`,
          success: false,
        });
      }
      existingItem.quantity += quantity;
    } else {
      // 🔥 THE FIX: Variant ka price nikalo. Agar variant me price nahi hai, toh main product ka lo
      const exactPrice = variant.price?.amount ? variant.price : product.price;

      // Naya item push karo
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity: quantity,
        price: exactPrice, // Ab yahan exact 600 INR hi save hoga!
      });
    }

    await cart.save();

    return res.status(200).json({
      message: existingItem ? "Cart updated" : "Product added to cart",
      success: true,
      cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, success: false });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = req.user;
    let cart = await getCartDetail(user._id);

    if (!cart) {
      cart = await cartModel.create({ user: user._id });
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    // 1. Safety check
    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be at least 1", success: false });
    }

    // 2. Product dhundho
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    // 3. Product ke andar se specific variant dhundho
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId,
    );
    if (!variant) {
      return res
        .status(404)
        .json({ message: "Variant not found", success: false });
    }

    // 4. Stock limit check karo
    const stock = variant.stock;
    if (quantity > stock) {
      return res.status(400).json({
        message: `Not enough stock, only ${stock} left`,
        success: false,
      });
    }

    // 5. Cart dhundho
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });
    }

    // 6. Cart ke andar wo specific item dhundho
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Item not in cart", success: false });
    }

    // 7. Quantity update karo aur save kar do
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res
      .status(200)
      .json({ message: "Quantity updated successfully", success: true, cart });
  } catch (error) {
    console.error("🔥 UPDATE QTY ERROR:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error", success: false });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });
    }

    // Filter out item
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variant?.toString() === variantId
        ),
    );

    await cart.save();

    return res
      .status(200)
      .json({ message: "Item removed successfully", success: true, cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const createOrder = async (req, res) => {
  console.log("INCOMING BODY:", req.body);
    try {
        const { isBuyNow, singleItem, items, shippingAddress } = req.body;
        const userId = req.user._id;
        
        let totalAmount = 0;

        // Backend Calculation for strict security
        if (isBuyNow && singleItem) {
            const product = await productModel.findById(singleItem.productId);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            
            const variant = product.variants.id(singleItem.variantId);
            if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

            if (variant.stock < singleItem.quantity) {
                 return res.status(400).json({ success: false, message: "Out of stock" });
            }
            totalAmount = variant.price.amount * singleItem.quantity;

        } else {
            const cartDetails = await getCartDetail(userId);
            if (!cartDetails || cartDetails.totalPrice === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }
            totalAmount = cartDetails.totalPrice;
        }

        // Shipping logic
        const shippingFee = totalAmount >= 2000 ? 0 : 150;
        const finalAmountToPay = totalAmount + shippingFee;

        // 1. Generate Razorpay Order
       const rzpOrder = await createOrderservice({
            amount: finalAmountToPay,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // 2. 🔥 CREATE "PENDING" ORDER IN DB FIRST 🔥
        const newOrder = new orderModel({
            user: userId,
            totalAmount: finalAmountToPay,
            paymentStatus: "Pending", // Set as pending initially
            orderStatus: "Processing",
            
            // Map items explicitly
            items: items.map(item => ({
                product: item.productId, 
                variant: item.variantId, 
                quantity: item.quantity,
                price: {
                      amount: item.price.amount,
                      currency: item.price.currency
                } // Expects { amount, currency }
            })),

            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode
            },

            paymentInfo: {
                razorpay_order_id: rzpOrder.id,
            }
        });

        await newOrder.save();

        // Send Razorpay ID + DB Order ID to frontend
        return res.status(200).json({ 
            success: true, 
            message: "Order initiated", 
            order: rzpOrder,
            dbOrderId: newOrder._id // Need this to update it later
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            dbOrderId, // Receive the MongoDB Order ID from frontend
            isBuyNow 
        } = req.body;

        const userId = req.user._id;

        // Fetch the pending order
        const order = await orderModel.findById(dbOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found in database" });
        }

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // 🔥 IF PAYMENT FAILED OR HACKED
        if (expectedSignature !== razorpay_signature) {
            order.paymentStatus = "Failed";
            await order.save();
            return res.status(400).json({ success: false, message: "Payment Verification Failed!" });
        }

        // 🔥 IF PAYMENT SUCCESS
        order.paymentStatus = "Paid";
        order.paymentInfo.razorpay_payment_id = razorpay_payment_id;
        order.paymentInfo.razorpay_signature = razorpay_signature;
        
        await order.save(); // Save updated status

        // 2. DECREASE STOCK FROM PRODUCTS
        for (const item of order.items) {
            await productModel.updateOne(
                { _id: item.product, "variants._id": item.variant },
                { $inc: { "variants.$.stock": -item.quantity } } 
            );
        }

        // 3. CLEAR CART (Only if it came from Cart flow)
        if (!isBuyNow) {
            await cartModel.findOneAndUpdate(
                { user: userId },
                { $set: { items: [] } } 
            );
        }

        return res.status(200).json({ 
            success: true, 
            message: "Payment verified and Order placed successfully!"
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
