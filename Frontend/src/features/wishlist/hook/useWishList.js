import { useDispatch, useSelector } from "react-redux";
import { setWishlist, toggleLocalWishlist } from "../state/wishlist.slice";
import { getWishlistApi, toggleWishlistApi } from "../services/wishlist.api";
import { useAuth } from "../../auth/hook/useAuth"; 
import { useNavigate } from "react-router-dom";

// 🔥 FIX: Constant memory reference for empty array
const EMPTY_WISHLIST = []; 

export const useWishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // 🔥 FIX: Use the stable constant
  const wishlistItems = useSelector((state) => state.wishlist?.items || EMPTY_WISHLIST);

  const handleGetWishlist = async () => {
    if (!currentUser) return;
    try {
      const data = await getWishlistApi();
      if (data.success) {
        const ids = data.wishlist.map((item) => item._id || item);
        dispatch(setWishlist(ids));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation(); 
    if (!currentUser) {
      navigate("/login");
      return;
    }
    dispatch(toggleLocalWishlist(productId));
    try {
      await toggleWishlistApi(productId);
    } catch (error) {
      console.error("Wishlist toggle failed, reverting UI:", error);
      dispatch(toggleLocalWishlist(productId));
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems.includes(productId);
  };

  return { handleGetWishlist, handleToggleWishlist, isWishlisted };
};