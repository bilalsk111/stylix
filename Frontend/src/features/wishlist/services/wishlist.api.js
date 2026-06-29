import axios from "axios";

const wishApiInstance = axios.create({
    baseURL: "/api/wishlist",
    withCredentials: true 
});

export const toggleWishlistApi = async (productId) => {
  const response = await wishApiInstance.post(
    "/toggle",
    { productId }
  );
  return response.data;
};

export const getWishlistApi = async () => {
  const response = await wishApiInstance.get("/");
  return response.data;
};