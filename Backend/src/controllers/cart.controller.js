import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
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

    // 2.  SMART LOGIC: Product ke andar se exact variant dhundho
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
    if (!cart) cart = await cartModel.create({ user: user._id });

    return res
      .status(200)
      .json({ message: "Cart fetched successfully", success: true, cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1)
      return res
        .status(400)
        .json({ message: "Quantity must be at least 1", success: false });

    const product = await productModel.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ message: "Product not found", success: false });

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId,
    );
    if (!variant)
      return res
        .status(404)
        .json({ message: "Variant not found", success: false });

    if (quantity > variant.stock)
      return res
        .status(400)
        .json({
          message: `Not enough stock, only ${variant.stock} left`,
          success: false,
        });

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    );

    if (itemIndex === -1)
      return res
        .status(404)
        .json({ message: "Item not in cart", success: false });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res
      .status(200)
      .json({ message: "Quantity updated successfully", success: true, cart });
  } catch (error) {
    console.error("UPDATE QTY ERROR:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error", success: false });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    let cart = await cartModel.findOne({ user: req.user._id });

    if (!cart)
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });

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
