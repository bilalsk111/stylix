import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";

import { useWishlist } from "../../wishlist/hook/useWishList";
import { useCart } from "../../cart/hook/useCart";

// 🔥 Import all the reusable components we created earlier
import { WishlistToast } from "../components/WishlistToast"; 
import { CartToast } from "../components/CartToast";
import { ProductCard } from "../components/ProductCard";
import { QuickViewModal } from "../components/QuickViewModal";

const ProductGrid = ({ products = [], title = "Recommended Drops", limit = 4 }) => {
  const navigate = useNavigate();
  
  const { handleToggleWishlist, isWishlisted } = useWishlist();
  const { handleAddItem } = useCart();
  const cartItems = useSelector((state) => state.cart?.items || []);

  // Modal State for Quick View
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const randomProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }, [products, limit]);

  const checkInCart = useCallback((productId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => {
      const itemToMatch = item.product?._id || item.product || item.productId?._id || item.productId || item._id;
      return String(itemToMatch) === String(productId);
    });
  }, [cartItems]);

  const onWishlist = useCallback((e, product) => {
    e.stopPropagation();
    const wasWishlisted = isWishlisted(product._id);
    handleToggleWishlist(e, product._id);

    toast.custom((t) => <WishlistToast product={product} isRemoving={wasWishlisted} />, {
      position: "bottom-center",
      duration: 2500,
      id: `wishlist-${product._id}`
    });
  }, [handleToggleWishlist, isWishlisted]);

  const onQuickAdd = useCallback(async (product, selectedSize, selectedColor) => {
    if (checkInCart(product._id)) {
      navigate("/bag");
      return;
    }

    try {
      await handleAddItem({
        productId: product._id,
        variantId: product.variants?.[0]?._id || undefined, 
        quantity: 1,
        // Yahan future me size/color pass kar sakta hai agar Modal se add ho
        size: selectedSize, 
        color: selectedColor 
      });

      toast.custom(
        (t) => (
          <CartToast
            product={product}
            onGoToCart={() => { toast.dismiss(t.id); navigate("/bag"); }}
          />
        ),
        { position: "bottom-center", duration: 3500, id: `cart-${product._id}` }
      );
    } catch (err) {
      console.error("Quick add failed:", err);
      toast.error("Couldn't add to bag.", { position: "bottom-center" });
    }
  }, [checkInCart, handleAddItem, navigate]);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="w-full bg-transparent">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-stone-200 pb-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-[#ccff00]"></span>
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500">
                Curated Selection
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <LayoutGrid size={24} className="text-stone-900" />
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-stone-900 leading-none">
                {title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/shop")}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5 group pb-1"
          >
            View Full Archive
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </button>
        </div>

        {/* GRID SECTION (Using Shared ProductCard) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
          {randomProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              wishlisted={isWishlisted(product._id)}
              onWishlist={onWishlist}
              onQuickAdd={() => onQuickAdd(product)} // Normal quick add from button
              addedToCart={checkInCart(product._id)}
              viewMode="grid" // Force grid view for this component
              onQuickView={setQuickViewProduct} // Open modal on Eye click
            />
          ))}
        </div>
      </div>

      {/* QUICK VIEW MODAL (Will trigger when Eye icon is clicked) */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onQuickAdd={onQuickAdd} // Will pass size/color from inside modal
        wishlisted={quickViewProduct ? isWishlisted(quickViewProduct._id) : false}
        onWishlist={onWishlist}
        addedToCart={quickViewProduct ? checkInCart(quickViewProduct._id) : false}
      />
    </section>
  );
};

export default ProductGrid;