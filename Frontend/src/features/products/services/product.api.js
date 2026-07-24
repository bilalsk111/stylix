import axios from "axios";

const productApi = axios.create({
  baseURL: "/api/products",
  withCredentials: true,
});

// Auto-refresh accessToken when it expires, then retry the original request
productApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      err.response?.data?.message === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
        return productApi(originalRequest);
      } catch {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);


export async function createProduct(formData) {
    const res = await productApi.post('/create',formData)
    return res.data
}
export const updateProduct = async (productId, formData) => {
  const res = await productApi.put(`/update/${productId}`, formData);
  return res.data;
};
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

export const deleteProductApi = async (productId) => {
  const response = await productApi.delete(`/${productId}`);
  return response.data;
};

export const deleteVariantApi = async (productId, variantId) => {
  const response = await productApi.delete(`/${productId}/variant/${variantId}`);
  return response.data;
};

export async function getShopFilteredProducts(queryParams = "") {
  // queryParams string hogi (e.g. "?category=MEN,WOMEN&minPrice=1000&sort=bestseller")
  const res = await productApi.get(`/shop${queryParams}`);
  return res.data;
}