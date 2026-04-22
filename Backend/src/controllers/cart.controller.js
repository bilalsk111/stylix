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


export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    // 1. Safety check
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1", success: false });
    }

    // 2. Seedha Product dhundho (getStock function ki zaroorat nahi hai, error yahi aa raha hoga)
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    // 3. Product ke andar se specific variant dhundho jiska stock check karna hai
    const variant = product.variants.find(v => v._id.toString() === variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found", success: false });
    }

    // 4. Stock limit check karo directly variant object se!
    const stock = variant.stock;
    if (quantity > stock) {
      return res.status(400).json({ message: `Not enough stock, only ${stock} left`, success: false });
    }

    // 5. Cart dhundho
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found", success: false });
    }

    // 6. Cart ke andar wo specific item dhundho
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant?.toString() === variantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not in cart", success: false });
    }

    // 7. Quantity update karo aur save kar do
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res.status(200).json({ message: "Quantity updated successfully", success: true, cart });

  } catch (error) {
    // 🔥 YAHAN CONSOLE.LOG LAGAYA HAI: Agar backend ab bhi fitega, toh aapke VS Code/Terminal me exact error dikhega
    console.error("🔥 UPDATE QTY ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error", success: false });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found", success: false });
    }

    // Fix: Proper filter logic -> UN items ko rakho jo current item se match NAHI karte
    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.variant?.toString() === variantId)
    );

    await cart.save();

    return res.status(200).json({ message: "Item removed successfully", success: true, cart });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
