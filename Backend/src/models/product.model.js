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
    subCategory: { type: String, trim: true },
    collectionName: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    salesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    attributes: { type: Map, of: String },
    price: { type: priceSchema, required: true },
    images: [{ url: { type: String, required: true } }],
    variants: [
      {
        title: { type: String, required: true },
        images: [{ url: { type: String, required: true } }],
        stock: { type: Number, default: 0 },
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

// High-Performance Indexes for 30k+ Products
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ "price.amount": 1 });
productSchema.index({ seller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: "text", description: "text", tags: "text" }); // Required for $text search
productSchema.index({ category: 1, "price.amount": 1 });

const productModel = mongoose.model("product", productSchema);
export default productModel;