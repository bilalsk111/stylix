import {
  createProduct,
  getSellerProduct,
  getAllProducts,
  getProductDetail,
  addProductVariant,
  editVariant,
  deleteVariantApi,
  deleteProductApi,
} from "../services/product.api";
import { useDispatch } from "react-redux";
import { removeProductLocally, removeVariantLocally, setAllProducts, setSellerProducts } from "../state/product.slice";
import toast from "react-hot-toast";
import { useState } from "react";

export function useProduct() {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateProduct = async (formData) => {
    const data = await createProduct(formData);
    return data.product;
  };
  const handleGetSellerProduct = async () => {
    try {
      const data = await getSellerProduct();
      const products = data.product || data.products || data;

      dispatch(setSellerProducts(products));
      return products;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  };
  const handleGetAllProduct = async () => {
    try {
      const data = await getAllProducts();
      const products = data.product || data.products || data;

      dispatch(setAllProducts(products));
      return products;
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  };
  async function handleGetProductById(productId) {
    const data = await getProductDetail(productId);
    return data.product;
  }

  async function handleAddProductVariant(productId, newProductVariant) {
    const data = await addProductVariant(productId, newProductVariant);

    return data;
  }
  async function handleEditVariant(productId, variantId, data) {
    const res = await editVariant(productId, variantId, data);
    return res
  }
  

  const handleDeleteProduct = async (productId) => {
    // Basic confirmation to prevent accidental clicks
    if (!window.confirm("Are you sure? This will erase the product, all variants, and images permanently.")) return;

    setIsDeleting(true);
    try {
      const res = await deleteProductApi(productId);
      if (res.success) {
        dispatch(removeProductLocally(productId));
        toast.success("Product permanently deleted.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteVariant = async (productId, variantId) => {
    if (!window.confirm("Remove this variant completely?")) return;

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
  };

  return {
    handleCreateProduct,
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
