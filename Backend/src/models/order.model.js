import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

// Item Schema (Sirf item details, koi status nahi)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: priceSchema,
    required: true,
  },
});

// Shipping Address Schema
const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
});

// Main Order Schema (Status yahan aayega)
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    totalAmount: {
      type: Number,
      required: true,
    },

    // 🔥 PAYMENT STATUS (Whole order context)
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // Razorpay Proofs
    paymentInfo: {
      razorpay_order_id: {
        type: String,
      },
      razorpay_payment_id: {
        type: String,
      },
      razorpay_signature: {
        type: String,
      },
    },

    // 🔥 FULFILLMENT STATUS (Admin track karega)
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
