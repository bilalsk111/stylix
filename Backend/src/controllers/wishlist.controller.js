import userModel from "../models/user.model.js";

// 1. THE TOGGLE ENGINE (Add/Remove)
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id; // 🔥 Teri auth middleware ye req.user set karti hogi, ensure karna.

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is missing." });
    }

    // Pehle user ko dhoondh
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check kar ki kya ye product pehle se wishlist mein hai
    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      // Pehle se hai? Toh nikal de ($pull)
      await userModel.findByIdAndUpdate(userId, {
        $pull: { wishlist: productId }
      });
      return res.status(200).json({ 
        success: true, 
        action: "removed",
        message: "Asset removed from Archive." 
      });
    } else {
      // Nahi hai? Toh daal de ($addToSet duplicates avoid karega)
      await userModel.findByIdAndUpdate(userId, {
        $addToSet: { wishlist: productId }
      });
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

    // 🔥 .populate() user ke array of IDs ko actual Product objects mein convert karega
    const user = await userModel.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist // Isme ab IDs nahi, pure products honge
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};