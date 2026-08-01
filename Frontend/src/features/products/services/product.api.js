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
  const res = await productApi.post('/create', formData);
  return res.data;
}

export const updateProduct = async (productId, formData) => {
  const res = await productApi.put(`/update/${productId}`, formData);
  return res.data;
};

export async function getSellerProduct() {
  const res = await productApi.get('/seller-products');
  return res.data;
}

export async function getAllProducts() {
  const res = await productApi.get('/');
  return res.data;
}

export async function getProductDetail(productId) {
  const res = await productApi.get(`/detail/${productId}`);
  return res.data;
}

export async function addProductVariant(productId, newProductVariant) {
  const formData = new FormData();

  if (newProductVariant.images && newProductVariant.images.length > 0) {
    newProductVariant.images.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      }
    });
  }

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

  formData.append("title", data.title || "");
  formData.append("stock", data.stock || 0);
  formData.append("priceAmount", data.price?.amount || 0);
  formData.append("priceCurrency", data.price?.currency || "INR");
  formData.append("attributes", JSON.stringify(data.attributes || {}));
  const res = await productApi.put(`/${productId}/variant/${variantId}`, formData);
  return res.data;
}

export const deleteProductApi = async (productId) => {
  const response = await productApi.delete(`/${productId}`);
  return response.data;
};

export const deleteVariantApi = async (productId, variantId) => {
  const response = await productApi.delete(`/${productId}/variant/${variantId}`);
  return response.data;
};


let shopAbortController = null;

export async function getShopFilteredProducts(queryParams = "") {
  // Check if a previous request is still pending, if yes, cancel it!
  if (shopAbortController) {
    shopAbortController.abort();
  }
  
  // Create a new controller for the current request
  shopAbortController = new AbortController();

  try {
    const res = await productApi.get(`/shop${queryParams}`, {
      signal: shopAbortController.signal, // Attach the signal
    });
    return res.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Previous rapid request canceled to save server load.");
      return null; // Don't throw error if we manually cancelled it
    }
    throw error;
  }
}