import axios from "axios";

const productApi = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})


export async function createProduct(formData) {
    const res = await productApi.post('/create',formData)
    return res.data
}
export async function getSellerProduct() {
    const res = await productApi.get('/seller-products')
    return res.data
}
export async function getAllProducts() {
    const res = await productApi.get('/')
    return res.data
}
export async function  getProductDetail(productId) {
     const res = await productApi.get(`/detail/${productId}`)
    return res.data
}

export async function addProductVariant(productId, newProductVariant) {
    const formData = new FormData();

    // ✅ prevent crash
    if (newProductVariant.images && newProductVariant.images.length > 0) {
        newProductVariant.images.forEach((img) => {
            formData.append("images", img.file);
        });
    }

    formData.append("stock", newProductVariant.stock);
    formData.append("priceAmount", newProductVariant.price.amount);
    formData.append("priceCurrency", newProductVariant.price.currency);
    formData.append("attributes", JSON.stringify(newProductVariant.attributes));

    const res = await productApi.post(`/${productId}/variant`, formData);;
    return res.data;
}

