import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";
import Wishlist from "../models/wishlist.model.js";
import Cart from "../models/cart.model.js";
import { deleteCloudinaryImages } from "../dao/deleteimage.dao.js";

export async function createProduct(req, res) {
  try {
    const {
      title,
      description,
      priceAmount,
      priceCurrency,
      stock,
      attributes,
      category,
      subCategory,
      collectionName,
      tags,
    } = req.body;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Seller not found." });
    }

    // Image Upload Logic
    const images = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadFile({
          buffer: file.buffer,
          fileName: `product-${Date.now()}-${file.originalname}`,
          folder: "stylix-products",
        });
        return { url };
      }),
    );

    // Attributes & Tags Parsing
    let parsedAttributes =
      typeof attributes === "string"
        ? JSON.parse(attributes)
        : attributes || {};

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch {
        parsedTags =
          typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
      }
    }

    const priceData = {
      amount: Number(priceAmount) || 0,
      currency: priceCurrency || "INR",
    };

    if (!title || !priceAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const categoryNormalized = category ? category.toUpperCase() : "MEN";

    // Main Product Payload
    const productData = {
      title,
      description,
      category: categoryNormalized,
      subCategory: subCategory ? subCategory.trim() : "",
      collectionName: collectionName ? collectionName.trim() : "",
      tags: parsedTags,
      seller: req.user._id,
      stock: Number(stock) || 0,
      attributes: parsedAttributes,
      price: priceData,
      images,
      variants: [
        {
          title: "Default",
          images,
          stock: Number(stock) || 0,
          attributes: parsedAttributes,
          price: priceData,
        },
      ],
    };

    const product = await productModel.create(productData);

    return res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        product,
      });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSellerProducts(req, res) {
  try {
    const products = await productModel
      .find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("getSellerProducts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllProducts(req, res) {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      filter.category = category.toUpperCase();
    }

    const products = await productModel
      .find(filter)
      .populate("variants")
      .populate("seller", "fullname email storeName")
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("getAllProducts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProductDetail(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel
      .findById(id)
      .populate("seller", "fullname email storeName")
      .lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Product details fetched successfully",
        product,
      });
  } catch (err) {
    console.error("getProductDetail error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, category, subCategory, collectionName, tags } =
      req.body;

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found or unauthorized" });
    }

    let parsedTags = product.tags;
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch {
        parsedTags =
          typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
      }
    }

    product.title = title || product.title;
    product.description =
      description !== undefined ? description : product.description;
    product.category = category ? category.toUpperCase() : product.category;
    product.subCategory =
      subCategory !== undefined ? subCategory.trim() : product.subCategory;
    product.collectionName =
      collectionName !== undefined
        ? collectionName.trim()
        : product.collectionName;
    product.tags = parsedTags;

    await product.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Main Product details updated successfully",
        product,
      });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error while updating main product",
      });
  }
};

export const addProductVariant = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const files = req.files || [];
    const images = [];

    if (files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
            folder: "stylix-products",
          });
          return { url };
        }),
      );
      images.push(...uploaded);
    }

    const categoryNormalized = req.body.category
      ? req.body.category.toUpperCase()
      : "MEN";
    const variantTitle =
      req.body.title || `Variant ${product.variants.length + 1}`;
    const stock = Number(req.body.stock) || 0;
    const priceAmt = Number(req.body.priceAmount) || product.price.amount;
    const priceCurr = req.body.priceCurrency || product.price.currency;

    let attributes = {};
    try {
      attributes = JSON.parse(req.body.attributes || "{}");
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid attributes JSON" });
    }

    product.variants.push({
      title: variantTitle,
      images: images.length > 0 ? images : product.images,
      stock,
      attributes,
      price: { amount: priceAmt, currency: priceCurr },
      category: categoryNormalized,
    });

    await product.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Product variant added successfully",
        product,
      });
  } catch (err) {
    console.error("addProductVariant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const editProductVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });

    const files = req.files || [];
    if (files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const url = await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
            folder: "stylix-products",
          });
          return { url };
        }),
      );
      variant.images = uploaded;
    }

    if (req.body.attributes) {
      try {
        variant.attributes = JSON.parse(req.body.attributes);
      } catch {
        return res
          .status(400)
          .json({ success: false, message: "Invalid attributes JSON" });
      }
    }

    variant.title = req.body.title || variant.title;
    variant.stock = req.body.stock ? Number(req.body.stock) : variant.stock;

    const newPriceAmount = req.body.priceAmount
      ? Number(req.body.priceAmount)
      : variant.price.amount;
    const newCurrency = req.body.priceCurrency || variant.price.currency;

    variant.price = { amount: newPriceAmount, currency: newCurrency };

    if (variant.title.toLowerCase() === "default") {
      product.price = { amount: newPriceAmount, currency: newCurrency };
    }

    await product.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Variant updated successfully",
        product,
      });
  } catch (err) {
    console.error("editProductVariant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });

    if (!product) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Product not found or unauthorized.",
        });
    }

    const allImages = [
      ...(product.images || []),
      ...(product.variants?.flatMap((v) => v.images || []) || []),
    ];

    let deletedImagesCount = 0;
    if (allImages.length > 0) {
      deletedImagesCount = await deleteCloudinaryImages(allImages);
    }

    await product.deleteOne();

    await Promise.all([
      Wishlist.updateMany(
        { items: productId },
        { $pull: { items: productId } },
      ),
      Cart.updateMany(
        { "items.productId": productId },
        { $pull: { items: { productId } } },
      ),
    ]);

    return res
      .status(200)
      .json({
        success: true,
        message: `Product and ${deletedImagesCount} images deleted.`,
      });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error during deletion.",
      });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
      _id: productId,
      seller: req.user._id,
    });
    if (!product)
      return res
        .status(404)
        .json({
          success: false,
          message: "Product not found or unauthorized.",
        });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res
        .status(404)
        .json({ success: false, message: "Variant not found." });

    if (variant.images && variant.images.length > 0) {
      await deleteCloudinaryImages(variant.images);
    }

    variant.deleteOne();
    await product.save();

    await Cart.updateMany(
      { "items.variantId": variantId },
      { $pull: { items: { variantId } } },
    );

    return res
      .status(200)
      .json({ success: true, message: "Variant deleted successfully." });
  } catch (error) {
    console.error("deleteVariant error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//  FULLY RESTORED & OPTIMIZED AGGREGATION PIPELINE
export const getFilteredProductsPro = async (req, res) => {
  try {
    const {
      category,
      collection,
      tags,
      stockStatus,
      size,
      color,
      minPrice,
      maxPrice,
      sort,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    // 1. Build the Match Stage
    let matchStage = {};
    let andConditions = [];

    // -- SMART SEARCH --
    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subCategory: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      });
    }

    // -- CATEGORY / SUBCATEGORY --
    if (category) {
      const cats = category
        .split(",")
        .map((c) => new RegExp(`^${c.trim()}$`, "i"));
      andConditions.push({
        $or: [{ category: { $in: cats } }, { subCategory: { $in: cats } }],
      });
    }

    // -- COLLECTION --
    if (collection) {
      const cols = collection
        .split(",")
        .map((c) => new RegExp(`^${c.trim()}$`, "i"));
      matchStage.collectionName = { $in: cols };
    }

    // -- TAGS --
    if (tags) {
      const tagArr = tags
        .split(",")
        .map((t) => new RegExp(`^${t.trim()}$`, "i"));
      matchStage.tags = { $in: tagArr };
    }

    // -- STOCK --
    if (stockStatus === "out_of_stock") matchStage.stock = 0;
    else if (stockStatus === "in_stock") matchStage.stock = { $gt: 0 };

    // -- SIZE & COLOR (Checks inside Variants) --
    if (size) {
      const sizes = size
        .split(",")
        .map((s) => new RegExp(`^${s.trim()}$`, "i"));
      matchStage["variants.attributes.SIZE"] = { $in: sizes };
    }
    if (color) {
      const colors = color
        .split(",")
        .map((c) => new RegExp(`^${c.trim()}$`, "i"));
      matchStage["variants.attributes.COLOR"] = { $in: colors };
    }

    // -- PRICE --
    if (minPrice || maxPrice) {
      matchStage["price.amount"] = {};
      if (minPrice) matchStage["price.amount"].$gte = Number(minPrice);
      if (maxPrice) matchStage["price.amount"].$lte = Number(maxPrice);
    }

    // Combine logical conditions safely
    if (andConditions.length > 0) {
      matchStage.$and = andConditions;
    }

    // 2. Build Sort Stage
    let sortStage = { createdAt: -1 };
    if (sort === "price_asc") sortStage = { "price.amount": 1 };
    if (sort === "price_desc") sortStage = { "price.amount": -1 };
    if (sort === "bestseller") sortStage = { salesCount: -1, createdAt: -1 };
    if (sort === "trending") sortStage = { views: -1, createdAt: -1 };
    if (sort === "oldest") sortStage = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const pageSize = Number(limit);

    // 3. AGGREGATION PIPELINE
    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: "totalDocuments" }],
          data: [
            { $skip: skip },
            { $limit: pageSize },
            //  POPULATE SELLER INSIDE AGGREGATION
            {
              $lookup: {
                from: "users", // Must match your MongoDB User collection name
                localField: "seller",
                foreignField: "_id",
                as: "sellerInfo",
              },
            },
            // Flatten the seller array
            {
              $unwind: {
                path: "$sellerInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            //  PROJECT ONLY NEEDED FIELDS (Saves Network Bandwidth)
            {
              $project: {
                title: 1,
                price: 1,
                images: 1,
                category: 1,
                subCategory: 1,
                stock: 1,
                tags: 1,
                collectionName: 1,
                variants: 1,
                createdAt: 1,
                "seller._id": "$sellerInfo._id",
                "seller.fullname": "$sellerInfo.fullname",
                "seller.storeName": "$sellerInfo.storeName",
              },
            },
          ],
        },
      },
    ];

    const result = await productModel.aggregate(pipeline);

    const products = result[0].data || [];
    const totalProducts = result[0].metadata[0]
      ? result[0].metadata[0].totalDocuments
      : 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    return res.status(200).json({
      success: true,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: Number(page),
        limit: pageSize,
      },
      products,
    });
  } catch (error) {
    console.error("Pro Filter Engine Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Database query failed" });
  }
};
