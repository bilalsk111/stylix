import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { createOrderservice } from "../services/payment.service.js";
import orderModel from "../models/order.model.js";

// Note: Agar aapka getStock function theek se variant check nahi karta, toh humne
// neeche directly variant.stock use kiya hai (jo zyada safe aur fast hai).
// import { getStock } from "../dao/product.dao.js";

async function getCartDetail(userId) {
  let cart = (
    await cartModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id),
        },
      },
      { $unwind: { path: "$items" } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "items.product",
        },
      },
      { $unwind: { path: "$items.product" } },
      {
        $unwind: { path: "$items.product.variants" },
      },
      {
        $match: {
          $expr: {
            $eq: ["$items.variant", "$items.product.variants._id"],
          },
        },
      },
      {
        $addFields: {
          itemPrice: {
            price: {
              $multiply: [
                "$items.quantity",
                "$items.product.variants.price.amount",
              ],
            },
            currency: "$items.product.variants.price.currency",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalPrice: { $sum: "$itemPrice.price" },
          currency: {
            $first: "$itemPrice.currency",
          },
          items: { $push: "$items" },
        },
      },
    ])
  )[0];
}

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
  try {
    const { isBuyNow, singleItem } = req.body;
    const userId = req.user._id;

    let totalAmount = 0;

    if (isBuyNow && singleItem) {
      // FLOW 1: SINGLE PRODUCT ("Buy It Now")
      const product = await Product.findById(singleItem.productId);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      const variant = product.variants.id(singleItem.variantId);
      if (!variant)
        return res
          .status(404)
          .json({ success: false, message: "Variant not found" });

      if (variant.stock < singleItem.quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Out of stock" });
      }

      totalAmount = variant.price.amount * singleItem.quantity;
    } else {
      // FLOW 2: ENTIRE CART
      const cartDetails = await getCartDetail(userId);
      if (!cartDetails || cartDetails.totalPrice === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }
      totalAmount = cartDetails.totalPrice;
    }

    // Add Shipping (Example: 2000 threshold)
    const shippingFee = totalAmount >= 2000 ? 0 : 150;
    const finalAmountToPay = totalAmount + shippingFee;

    // Call Razorpay API
    const order = await createOrderservice({
      amount: finalAmountToPay,
      currency: "INR",
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      order,
      amountCalculated: finalAmountToPay,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    // 1. Extract data from Frontend
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      totalAmount,
      isBuyNow,
    } = req.body;

    const userId = req.user._id;

    // 2. STRICT RAZORPAY SIGNATURE VERIFICATION
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Payment Verification Failed! Hack attempt detected.",
        });
    }

    // 3. EXPLICIT SCHEMA MAPPING (Security Measure)
    const newOrder = new orderModel({
      user: userId,
      totalAmount: totalAmount,
      paymentStatus: "Paid",
      orderStatus: "Processing",

      // Map items directly to match orderItemSchema
      items: items.map((item) => ({
        product: item.productId,
        variant: item.variantId,
        quantity: item.quantity,
        price: item.price, // Expects { amount, currency }
      })),

      // Map shipping explicitly to prevent mass-assignment
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

      // Map razorpay details
      paymentInfo: {
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      },
    });

    // 4. SAVE TO MONGODB
    await newOrder.save();

    // 5. DECREASE STOCK FROM PRODUCTS
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } },
      );
    }

    // 6. CLEAR CART (Only if it came from Cart flow)
    if (!isBuyNow) {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and Order placed successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
