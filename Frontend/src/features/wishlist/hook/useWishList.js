import { useDispatch, useSelector } from "react-redux";
import { setWishlist, toggleLocalWishlist } from "../state/wishlist.slice";
import { getWishlistApi, toggleWishlistApi } from "../services/wishlist.api";
import { useAuth } from "../../auth/hook/useAuth"; 
import { useNavigate } from "react-router-dom";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  // 1. Fetch data on login/load
  const handleGetWishlist = async () => {
    if (!currentUser) return;
    try {
      const data = await getWishlistApi();
      if (data.success) {
        // Backend se pure kapde aayenge, humein sirf unki _id nikalni hai redux ke liye
        const ids = data.wishlist.map((item) => item._id || item);
        dispatch(setWishlist(ids));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  // 2. Toggle Engine (Optimistic Update)
  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation(); // Card ko click hone se rokega

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // 🔥 Optimistic UI: API ka wait kiye bina turant UI red kar do
    dispatch(toggleLocalWishlist(productId));

    try {
      await toggleWishlistApi(productId);
      // Agar backend se remove/add ho gaya toh badhiya hai
    } catch (error) {
      // ⚠️ Agar network issue aya, toh jo change kiya tha usko revert/undo kar do
      console.error("Wishlist toggle failed, reverting UI:", error);
      dispatch(toggleLocalWishlist(productId));
    }
  };

  // 3. Helper function for UI to easily check status
  const isWishlisted = (productId) => {
    return wishlistItems.includes(productId);
  };

  return { handleGetWishlist, handleToggleWishlist, isWishlisted };
};