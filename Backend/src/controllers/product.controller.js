import productModel from "../models/product.model.js";
import {
    uploadFile
} from "../services/storage.service.js";
import Wishlist from "../models/wishlist.model.js";
import Cart from "../models/cart.model.js";
import {
    deleteCloudinaryImages
} from "../dao/deleteimage.dao.js";

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
        } = req.body;

        if (!req.user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Unauthorized. Seller not found."
                });
        }

        const images = await Promise.all(
            req.files.map(async (file) => {
                const url = await uploadFile({
                    buffer: file.buffer,
                    fileName: `product-${Date.now()}-${file.originalname}`,
                    folder: "stylix-products",
                });
                return {
                    url
                };
            }),
        );

        let parsedAttributes = {};
        try {
            parsedAttributes =
                typeof attributes === "string" ? JSON.parse(attributes) : attributes;
        } catch (e) {
            parsedAttributes = {
                error: "Parse Failed"
            };
        }

        const priceData = {
            amount: Number(priceAmount) || 0,
            currency: priceCurrency || "INR",
        };
        if (!title || !priceAmount) {
            return res
                .status(400)
                .json({
                    message: "Missing required fields",
                    success: false
                });
        }
        const normalizeCategory = (cat) => {
            if (!cat) return "MEN";
            return cat.toUpperCase();
        };
        const categoryNormalized = normalizeCategory(category);
        const productData = {
            title,
            description,
            category: categoryNormalized,
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
                category: categoryNormalized,
            }, ],
        };

        const product = await productModel.create(productData);

        return res.status(201).json({
            message: "Product created successfully",
            success: true,
            product,
        });
    } catch (err) {
        console.error("createProduct error:", err);
        res.status(500).json({
            message: err.message,
            success: false
        });
    }
}

export async function getSellerProducts(req, res) {
    try {
        const products = await productModel
            .find({
                seller: req.user._id
            }) // _id pass karo
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (err) {
        console.error("getSellerProducts error:", err);
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
}
export async function getAllProducts(req, res) {
    try {
        const {
            category
        } = req.query;
        let filter = {};
        const normalizeCategory = (cat) => {
            if (!cat) return "MEN";
            return cat.toUpperCase();
        };
        const categoryNormalized = normalizeCategory(category);
        if (category) {
            filter.category = normalizeCategory(category);
        }

        const products = await productModel
            .find(filter)
            .populate("variants")
            .populate("seller", "fullname email")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            count: products.length,
            products,
        });
    } catch (err) {
        console.error("getSellerProducts error:", err);
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
}

export async function getProductDetail(req, res) {
    try {
        const {
            id
        } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Product details fetched successfully",
            success: true,
            product,
        });
    } catch (err) {
        console.error("getProductDetail error:", err);
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
}

export const addProductVariant = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id,
        });

        if (!product) {
            return res
                .status(404)
                .json({
                    message: "Product not found",
                    success: false
                });
        }

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
                    return {
                        url
                    };
                }),
            );
            images.push(...uploaded);
        }
        const normalizeCategory = (cat) => {
            if (!cat) return "MEN";
            return cat.toUpperCase();
        };
        const category = req.body.category || "MEN";
        const categoryNormalized = normalizeCategory(category);
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
                .json({
                    message: "Invalid attributes JSON",
                    success: false
                });
        }

        product.variants.push({
            title: variantTitle,
            images: images.length > 0 ? images : product.images,
            stock,
            attributes,
            price: {
                amount: priceAmt,
                currency: priceCurr,
            },
            category: categoryNormalized,
        });

        await product.save();

        return res.status(200).json({
            message: "Product variant added successfully",
            success: true,
            product,
        });
    } catch (err) {
        console.error("addProductVariant error:", err);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};
export const editProductVariant = async (req, res) => {
    try {
        const {
            productId,
            variantId
        } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id,
        });

        if (!product) {
            return res
                .status(404)
                .json({
                    message: "Product not found",
                    success: false
                });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res
                .status(404)
                .json({
                    message: "Variant not found",
                    success: false
                });
        }

        // Images update logic (same as before)
        const files = req.files || [];
        if (files.length > 0) {
            const uploaded = await Promise.all(
                files.map(async (file) => {
                    const url = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname,
                        folder: "stylix-products",
                    });
                    return {
                        url
                    };
                }),
            );
            variant.images = uploaded;
        }

        // Attributes parse
        if (req.body.attributes) {
            try {
                variant.attributes = JSON.parse(req.body.attributes);
            } catch {
                return res.status(400).json({
                    message: "Invalid attributes JSON"
                });
            }
        }

        //Update Variant Fields
        variant.title = req.body.title || variant.title;
        variant.stock = req.body.stock ? Number(req.body.stock) : variant.stock;

        const newPriceAmount = req.body.priceAmount ?
            Number(req.body.priceAmount) :
            variant.price.amount;
        const newCurrency = req.body.priceCurrency || variant.price.currency;

        variant.price = {
            amount: newPriceAmount,
            currency: newCurrency,
        };

        // SYNC LOGIC: Agar ye "Default" variant hai, toh Main Product ka price bhi update karo
        if (variant.title.toLowerCase() === "default") {
            product.price = {
                amount: newPriceAmount,
                currency: newCurrency,
            };
            // Option: Agar main title bhi update karna chahte ho toh:
            // product.title = variant.title === "Default" ? product.title : variant.title;
        }

        // Save Product (Parent document save hote hi variant bhi save ho jayega)
        await product.save();

        return res.status(200).json({
            message: "Variant and Main Price updated successfully",
            success: true,
            product,
        });
    } catch (err) {
        console.error("editProductVariant error:", err);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const {
            productId
        } = req.params;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // Flatten all images into a single array
        const allImages = [
            ...(product.images || []),
            ...(product.variants ? .flatMap((v) => v.images || []) || []),
        ];

        // Delete all images from Cloudinary
        const deletedImagesCount = await deleteCloudinaryImages(allImages);

        // Delete from DB
        await productModel.findByIdAndDelete(productId);

        // Parallel DB Cleanup
        await Promise.all([
            Wishlist.updateMany({
                items: productId
            }, {
                $pull: {
                    items: productId
                }
            }),
            Cart.updateMany({
                "items.productId": productId
            }, {
                $pull: {
                    items: {
                        productId
                    }
                }
            }),
        ]);

        res.status(200).json({
            success: true,
            message: `Product and ${deletedImagesCount} images deleted successfully.`,
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteVariant = async (req, res) => {
    try {
        const {
            productId,
            variantId
        } = req.params;

        const product = await productModel.findById(productId);

        if (!product)
            return res.status(404).json({
                message: "Product not found."
            });

        const variant = product.variants.id(variantId);

        if (!variant)
            return res.status(404).json({
                message: "Variant not found."
            });

        await deleteCloudinaryImages(variant.images);

        variant.deleteOne(); // remove variant
        await product.save();

        await Cart.updateMany({
            "items.variantId": variantId
        }, {
            $pull: {
                items: {
                    variantId
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Variant deleted successfully.",
        });
    } catch (error) {
        console.error("deleteVariant error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// export const getFilteredProducts = async (req, res) => {
//     try {
//         // 1. URL se saare query parameters extract karo
//         // Example URL: /api/products?category=men&size=L,M&sort=price_asc&minPrice=1000
//         const { category, size, color, minPrice, maxPrice, sort, search } = req.query;

//         let query = {};

//         // 2. Search Logic (Regex for partial matching)
//         if (search) {
//             query.title = { $regex: search, $options: "i" }; // 'i' means case-insensitive
//         }

//         // 3. Category Filter (Supports multiple categories like category=men,women)
//         if (category) {
//             query.category = { $in: category.split(',') };
//         }

//         // 4. Variant Filters (Size & Color)
//         // Assume kar raha hu size/color tere variants array ke andar hain
//         if (size) {
//             query["variants.size"] = { $in: size.split(',') };
//         }
//         if (color) {
//             query["variants.color"] = { $in: color.split(',') };
//         }

//         // 5. Price Filter (Min and Max)
//         if (minPrice || maxPrice) {
//             // Check kar tera schema mein price kahan hai.
//             // Agar nested hai toh "price.amount" likh, agar direct hai toh sirf "price" likh.
//             query["price.amount"] = {};
//             if (minPrice) query["price.amount"].$gte = Number(minPrice);
//             if (maxPrice) query["price.amount"].$lte = Number(maxPrice);
//         }

//         // 6. Sorting Logic
//         let sortOption = {};
//         switch (sort) {
//             case "price_asc":
//                 sortOption = { "price.amount": 1 }; // Sasta pehle
//                 break;
//             case "price_desc":
//                 sortOption = { "price.amount": -1 }; // Mehenga pehle
//                 break;
//             case "newest":
//                 sortOption = { createdAt: -1 }; // Naya stock pehle
//                 break;
//             default:
//                 sortOption = { createdAt: -1 }; // Default sorting
//         }

//         // 7. Execute the Query
//         // Sirf active products dikhao jo hide nahi kiye gaye hain
//         query.status = "Active";

//         const products = await productModel.find(query).sort(sortOption);

//         return res.status(200).json({
//             success: true,
//             count: products.length,
//             products
//         });

//     } catch (error) {
//         console.error("Filter Engine Error:", error);
//         return res.status(500).json({ success: false, message: "Database query failed" });
//     }
// };

export const getFilteredProductsPro = async (req, res) => {
    try {
        const {
            category,
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
        let matchStage = {}; // 1: Status check hata diya kyunki DB mein status nahi hai.

        if (search) {
            matchStage.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            const categories = category
                .split(",")
                .map((c) => new RegExp(`^${c.trim()}$`, "i"));
            matchStage.category = {
                $in: categories
            };
        }

        // 2: Correct Path & Case-Insensitive Regex for SIZE
        if (size) {
            const sizes = size
                .split(",")
                .map((s) => new RegExp(`^${s.trim()}$`, "i"));
            matchStage["variants.attributes.SIZE"] = {
                $in: sizes
            };
        }

        // 3: Correct Path & Case-Insensitive Regex for COLOR
        if (color) {
            const colors = color
                .split(",")
                .map((c) => new RegExp(`^${c.trim()}$`, "i"));
            matchStage["variants.attributes.COLOR"] = {
                $in: colors
            };
        }

        if (minPrice || maxPrice) {
            // Price root par bhi hai aur variants mein bhi. Root wala filter kar rahe hain.
            matchStage["price.amount"] = {};
            if (minPrice) matchStage["price.amount"].$gte = Number(minPrice);
            if (maxPrice) matchStage["price.amount"].$lte = Number(maxPrice);
        }

        // 2. Build the Sort Stage
        let sortStage = {
            createdAt: -1
        };
        if (sort === "price_asc") sortStage = {
            "price.amount": 1
        };
        if (sort === "price_desc") sortStage = {
            "price.amount": -1
        };

        // 3. Pagination Logic
        const skip = (Number(page) - 1) * Number(limit);
        const pageSize = Number(limit);

        //  THE PRO WAY: MONGODB AGGREGATION PIPELINE 
        const pipeline = [{
                $match: matchStage
            }, // Pehle filter karo
            {
                $sort: sortStage
            }, // Phir sort karo
            {
                // $facet 2 alag queries ek sath chalata hai parallel mein
                $facet: {
                    metadata: [{
                            $count: "totalDocuments"
                        }, // Total count nikalta hai pagination ke liye
                    ],
                    data: [{
                            $skip: skip
                        }, // Page ke hisaab se skip karo
                        {
                            $limit: pageSize
                        }, // Sirf limit jitne items uthao
                    ],
                },
            },
        ];

        const result = await productModel.aggregate(pipeline);

        // Data format theek karna (kyunki $facet array return karta hai)
        const products = result[0].data;
        const totalProducts = result[0].metadata[0] ?
            result[0].metadata[0].totalDocuments :
            0;
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
            .json({
                success: false,
                message: "Database query failed"
            });
    }
};