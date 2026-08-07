import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  createProduct,
  getSellerProduct,
  getProductDetail,
  addProductVariant,
  editVariant,
  deleteVariantApi,
  deleteProductApi,
  updateProduct,
  getShopFilteredProducts
} from "../services/product.api";
import { 
  removeProductLocally, 
  removeVariantLocally, 
  setAllProducts, 
  setSellerProducts, 
  updateProductLocally 
} from "../state/product.slice";

export function useProduct() {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateProduct = useCallback(async (formData) => {
    const data = await createProduct(formData);
    return data.product;
  }, []);

  const handleUpdateProduct = useCallback(async (productId, data) => {
    try {
      const res = await updateProduct(productId, data);
      dispatch(updateProductLocally(res.product));
      toast.success("Product updated.");
      return res.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product.");
      throw error;
    }
  }, [dispatch]);

  const handleGetSellerProduct = useCallback(async () => {
    try {
      const data = await getSellerProduct();
      const products = data.product || data.products || data;
      dispatch(setSellerProducts(products));
      return products;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }, [dispatch]);

  const handleGetAllProduct = useCallback(async (query = "?limit=12") => {
    try {
      const data = await getShopFilteredProducts(query); 
      const products = data?.products || [];
      dispatch(setAllProducts(products));
      return products;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }, [dispatch]);

  const handleGetProductById = useCallback(async (productId) => {
    if (!productId) return;
    try {
      const data = await getProductDetail(productId);
      return data.product;
    } catch (error) {
      console.error("Fetch Product Details error:", error);
      throw error;
    }
  }, []);

  const handleAddProductVariant = useCallback(async (productId, newProductVariant) => {
    return await addProductVariant(productId, newProductVariant);
  }, []);

  const handleEditVariant = useCallback(async (productId, variantId, data) => {
    return await editVariant(productId, variantId, data);
  }, []);

  const handleDeleteProduct = useCallback(async (productId) => {
    setIsDeleting(true);
    try {
      const res = await deleteProductApi(productId);
      if (res.success) {
        dispatch(removeProductLocally(productId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch]);

  const handleDeleteVariant = useCallback(async (productId, variantId) => {
    setIsDeleting(true);
    try {
      const res = await deleteVariantApi(productId, variantId);
      if (res.success) {
        dispatch(removeVariantLocally({ productId, variantId }));
        toast.success("Variant deleted.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete variant.");
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch]);

  return {
    handleCreateProduct,
    handleUpdateProduct,
    handleGetAllProduct,
    handleGetSellerProduct,
    handleGetProductById,
    handleAddProductVariant,
    handleEditVariant,
    handleDeleteProduct,
    handleDeleteVariant,
    isDeleting,
  };
}