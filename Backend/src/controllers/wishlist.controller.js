import Wishlist from "../models/wishlist.model.js";

// 1. THE TOGGLE ENGINE (Add/Remove)
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is missing." });
    }

    // Correct Query: Find the wishlist WHERE the user field matches userId
    let wishlist = await Wishlist.findOne({ user: userId });

    // If wishlist doesn't exist at all, CREATE it with this first item
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [productId]
      });
      return res.status(200).json({ 
        success: true, 
        action: "added",
        message: "Archive created and asset secured." 
      });
    }

    // Check if product is already in the array
    const isWishlisted = wishlist.items.includes(productId);

    if (isWishlisted) {
      // Remove it
      await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { items: productId } }
      );
      return res.status(200).json({ 
        success: true, 
        action: "removed",
        message: "Asset removed from Archive." 
      });
    } else {
      // Add it
      await Wishlist.findOneAndUpdate(
        { user: userId },
        { $addToSet: { items: productId } }
      );
      return res.status(200).json({ 
        success: true, 
        action: "added",
        message: "Asset secured in Archive." 
      });
    }
  } catch (error) {
    console.error("Wishlist Toggle Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// 2. THE FETCH ENGINE (Get Full Wishlist with Product Data)
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId }).populate("items");

    // Do NOT throw a 404 if they don't have a wishlist. 
    // Just return an empty array so the frontend doesn't crash.
    if (!wishlist) {
      return res.status(200).json({ success: true, wishlist: [] });
    }

    return res.status(200).json({
      success: true,
      wishlist: wishlist.items
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};