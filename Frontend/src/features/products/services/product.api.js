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

