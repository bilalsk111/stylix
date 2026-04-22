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
  { timestamps: true },
);

const productModel = mongoose.model("product", productSchema);
export default productModel;
