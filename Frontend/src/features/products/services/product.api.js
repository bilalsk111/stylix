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

    // ✅ Image Handling
    if (newProductVariant.images && newProductVariant.images.length > 0) {
        newProductVariant.images.forEach((img) => {
            // Check if it's a new file or existing url
            if (img.file) {
                formData.append("images", img.file);
            }
        });
    }

    // ✅ Map fields to match Backend expectations
    formData.append("title", newProductVariant.title || "");
    formData.append("stock", newProductVariant.stock || 0);
    formData.append("priceAmount", newProductVariant.price?.amount || 0);
    formData.append("priceCurrency", newProductVariant.price?.currency || "INR");
    formData.append("attributes", JSON.stringify(newProductVariant.attributes || {}));

    const res = await productApi.post(`/${productId}/variant`, formData);
    return res.data;
}

export async function editVariant(productId, variantId, data) {
     const formData = new FormData();

    if (data.images && data.images.length > 0) {
        data.images.forEach((img) => {
            if (img.file) {
                formData.append("images", img.file);
            }
        });
    }

    // ✅ Map fields to match Backend expectations
    formData.append("title", data.title || "");
    formData.append("stock", data.stock || 0);
    formData.append("priceAmount", data.price?.amount || 0);
    formData.append("priceCurrency", data.price?.currency || "INR");
    formData.append("attributes", JSON.stringify(data.attributes || {}));
    const res = await productApi.put(`/${productId}/variant/${variantId}`, formData)
    return res.data

}