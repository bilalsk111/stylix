import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWishlist, toggleLocalWishlist } from "../state/wishlist.slice";
import { getWishlistApi, toggleWishlistApi } from "../services/wishlist.api";
import { useAuth } from "../../auth/hook/useAuth"; 
import { useNavigate } from "react-router-dom";

const EMPTY_WISHLIST = []; 

export const useWishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const wishlistItems = useSelector((state) => state.wishlist?.items || EMPTY_WISHLIST);

  const handleGetWishlist = useCallback(async () => {
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
  }, [currentUser, dispatch]);

  const handleToggleWishlist = useCallback(async (e, productId) => {
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
  }, [currentUser, navigate, dispatch]);

  const isWishlisted = useCallback((productId) => {
    return wishlistItems.includes(productId);
  }, [wishlistItems]);

  return { handleGetWishlist, handleToggleWishlist, isWishlisted };
};