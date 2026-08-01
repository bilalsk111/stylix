import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    category: {
      type: String,
      enum: ["MEN", "WOMEN", "KID", "UNISEX"],
      required: true,
      default: "MEN",
    },
 //CLOTHING TYPE (Yahan aayega "Hoodies", "Tees", "Footwear")
    subCategory: { 
      type: String, 
      trim: true 
    },
 // COLLECTIONS (Yahan aayega "Archive Collection", "Signature Line")
    collectionName: { 
      type: String, 
      trim: true 
    },
//FLEXIBLE TAGS (Custom labels jaise "Limited Drop", "Winter Edit")
    tags: [{ 
      type: String, 
      trim: true 
    }],
// ANALYTICS (Inke bina Bestseller/Trending nahi banega)
    salesCount: { type: Number, default: 0 }, // Kitne items bike (For "BESTSELLER")
    views: { type: Number, default: 0 },      // Kitne logo ne click kiya (For "TRENDING")

    stock: { type: Number, default: 0 },
    
    // Yahan Color aur Size save hoga (Main product level pe agar zaroorat ho)
    attributes: { type: Map, of: String }, 
    
    price: { type: priceSchema, required: true },
    images: [{ url: { type: String, required: true } }],
    
    variants: [
      {
        title: { type: String, required: true },
        images: [{ url: { type: String, required: true } }],
        stock: { type: Number, default: 0 },
        
        // Variants ke andar hi exact SIZE aur COLOR set hone chahiye
        attributes: { type: Map, of: String }, 
        
        price: { type: priceSchema, required: true },
        category: {
          type: String,
          enum: ["MEN", "WOMEN", "KID", "UNISEX"],
          required: true,
          default: "MEN",
        },
      },
    ],
  },
  { timestamps: true }
);

// Optional: Indexing queries fast karne ke liye
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ salesCount: -1 }); 
productSchema.index({ "price.amount": 1 }); 
productSchema.index({ seller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, "price.amount": 1 });

const productModel = mongoose.model("product", productSchema);
export default productModel;