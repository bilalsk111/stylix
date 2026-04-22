import {
  createProduct,
  getSellerProduct,
  getAllProducts,
  getProductDetail,
  addProductVariant,
  editVariant,
} from "../services/product.api";
import { useDispatch } from "react-redux";
import { setAllProducts, setSellerProducts } from "../state/product.slice";

export function useProduct() {
  const dispatch = useDispatch();

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

  return {
    handleCreateProduct,
    handleGetAllProduct,
    handleGetSellerProduct,
    handleGetProductById,
    handleAddProductVariant,
    handleEditVariant
  };
}
