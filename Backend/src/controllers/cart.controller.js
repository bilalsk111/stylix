import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

import { getStock } from "../dao/product.dao.js";

export const addtocart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;

    const stock = await getStock(productId, variantId);

    if (stock < quantity) {
      return res.status(400).json({ message: "Not enough stock", success: false });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    // Find if the item already exists in the cart
   const existingItem = cart.items.find(
  (item) =>
    item.product.toString() === productId &&
    item.variant?.toString() === variantId
);

    if (existingItem) {
      if (existingItem.quantity + quantity > stock) {
        return res.status(400).json({
          message: `Only ${stock} items in stock. You already have ${existingItem.quantity} in cart.`,
          success: false,
        });
      }

      existingItem.quantity += quantity;
    } else {

      if (quantity > stock) {
        return res.status(400).json({ message: "Not enough stock", success: false });
      }
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    return res.status(200).json({
      message: existingItem ? "Cart updated" : "Product added to cart",
      success: true,
      cart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const getCart = async (req, res) => {
    const user = req.user

    let cart = await cartModel.findOne({ user: user._id }).populate("items.product")

    if (!cart) {
        cart = await cartModel.create({ user: user._id })
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
    })
}