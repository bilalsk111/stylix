import productModel from "../models/product.model.js";

export const getStock = async (productId, variantId = null) => {
  const product = await productModel.findById(productId);

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (variantId) {
    const variant = product.variants?.find(
      (v) => v._id.toString() === variantId
    );

    if (!variant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    return variant.stock;
  }

  return product.stock;
};