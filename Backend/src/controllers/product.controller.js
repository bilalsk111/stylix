import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency, stock, attributes } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized. Seller not found." });
    }

    const images = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadFile({
          buffer: file.buffer,
          fileName: `product-${Date.now()}-${file.originalname}`,
        });
        return { url };
      })
    );

    let parsedAttributes = {};
    try {
      parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    } catch (e) {
      parsedAttributes = { error: "Parse Failed" };
    }

    const priceData = {
      amount: Number(priceAmount) || 0,
      currency: priceCurrency || "INR",
    };

    const productData = {
      title,
      description,
      seller: req.user._id,
      stock: Number(stock) || 0,
      attributes: parsedAttributes,
      price: priceData,
      images: images,
      variants: [{
        title: "Default", 
        images: images,
        stock: Number(stock) || 0,
        attributes: parsedAttributes,
        price: priceData,
      }]
    };

    const product = await productModel.create(productData);

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

// export async function EditProduct(req, res) {
//   const { id } = req.params

//   const product = productModel.findById(id)
//   if (!product) {
//     return res.status(401).json({
//       message: "Product not found",
//       success: false,
//       product
//     })
//   }
//   const editproduct = productModel.findByIdAndUpdate()
// }
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
    const product = await productModel.findOne({ _id: productId, seller: req.user._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    const files = req.files || [];
    const images = [];

    if (files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadFile({ buffer: file.buffer, fileName: file.originalname });
          return { url };
        })
      );
      images.push(...uploaded);
    }

    const variantTitle = req.body.title || `Variant ${product.varinate.length + 1}`;
    const stock = Number(req.body.stock) || 0;
    const priceAmt = Number(req.body.priceAmount) || product.price.amount;
    const priceCurr = req.body.priceCurrency || product.price.currency;

    let attributes = {};
    try {
      attributes = JSON.parse(req.body.attributes || "{}");
    } catch {
      return res.status(400).json({ message: "Invalid attributes JSON", success: false });
    }

    product.variants.push({
      title: variantTitle, // Use the provided title
      images: images.length > 0 ? images : product.images, // Fallback to main images if none uploaded
      stock,
      attributes,
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