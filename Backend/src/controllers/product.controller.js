import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const images = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
        });
        return { url };
      })
    );

    const product = await productModel.create({
      title,
      description,
      price: {
        amount: priceAmount,
        currency: priceCurrency || "INR",
      },
      images,
      seller: seller._id,
    });

    return res.status(201).json({
      message: "Product created successfully",
      success: true,
      product,
    });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ message: err.message, success: false });
  }
}

export async function EditProduct(req, res) {
  const { id } = req.params

  const product = productModel.findById(id)
  if (!product) {
    return res.status(401).json({
      message: "Product not found",
      success: false,
      product
    })
  }
  const editproduct = productModel.findByIdAndUpdate()
}
export async function getSellerProducts(req, res) {
  try {
    const products = await productModel.find({ seller: req.user._id })  // ✅ _id pass karo
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("getSellerProducts error:", err);
    return res.status(500).json({ message: err.message, success: false });
  }
}
export async function getAllProducts(req, res) {
  try {
    const products = await productModel.find()
      .populate("seller", "fullname email").sort({ createdAt: -1 })

    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("getSellerProducts error:", err);
    return res.status(500).json({ message: err.message, success: false });
  }
}

export async function getProductDetail(req, res) {
  const { id } = req.params
  const product = await productModel.findById(id)
  if (!product) {
    return res.status(400).json({
      message: "product not found",
      success: false
    })
  }
  return res.status(200).json({
    message: "Product details fetched succeddfully",
    success: true,
    product
  })
}

export const addProductVariant = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    // ── Upload images (if any) ─────────────────────────────────────
    const files = req.files || [];
    const images = [];

    if (files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadFile({ buffer: file.buffer, fileName: file.originalname });
          return { url }; // ← this is what Mongoose expects
        })
      );
      images.push(...uploaded);
    }

    // ── Parse body fields ──────────────────────────────────────────
    const stock = Number(req.body.stock) || 0;
    const priceAmt = Number(req.body.priceAmount) || product.price.amount;
    const priceCurr = req.body.priceCurrency || product.price.currency;


    let attributes = {};
    try {
      attributes = JSON.parse(req.body.attributes || "{}");
    } catch {
      return res.status(400).json({ message: "Invalid attributes JSON", success: false });
    }

    // ── FIX: schema field is `varinate`, NOT `variants` ───────────
    product.varinate.push({
      images,
      stock,
      attributes,          // Mongoose Map accepts a plain object here
      price: {
        amount: priceAmt,
        currency: priceCurr,
      },
    });

    await product.save();

    return res.status(200).json({
      message: "Product variant added successfully",
      success: true,
      product,
    });
  } catch (err) {
    console.error("addProductVariant error:", err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};