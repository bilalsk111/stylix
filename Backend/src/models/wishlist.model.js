import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true // Ek user ki ek hi wishlist hogi
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  }]
}, { timestamps: true });

 const WishlistModel = mongoose.model("Wishlist", wishlistSchema);
 export default WishlistModel;