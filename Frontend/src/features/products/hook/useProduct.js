import { createProduct,getSellerProduct,getAllProducts, getProductDetail} from "../services/product.api"
import {useDispatch} from "react-redux"
import { setAllProducts, setSellerProducts } from "../state/product.slice"


export function useProduct(){
    const dispatch = useDispatch()

    const handleCreateProduct = async (formData)=>{
        const data = await createProduct(formData)
       return data.product
    }
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
    const handleGetAllProduct=async()=>{
        try {
        const data = await getAllProducts();
        const products = data.product || data.products || data;
        
        dispatch(setAllProducts(products));
        return products;
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
    }
   async function handleGetProductById(productId) {
        const data = await getProductDetail(productId)
        return data.product
    }
    return{ 

        handleCreateProduct,handleGetAllProduct,handleGetSellerProduct,handleGetProductById
    }
}