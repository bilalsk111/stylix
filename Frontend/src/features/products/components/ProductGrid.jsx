import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowUpRight, LayoutGrid, Plus, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useWishlist } from "../../wishlist/hook/useWishList";
import { useCart } from "../../cart/hook/useCart";

/* ─── Premium Wishlist Toast (Handles Both Add & Remove) ─────── */
const WishlistToast = ({ product, isRemoving }) => (
  <div className="flex items-center gap-4 bg-white border border-stone-100 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[280px] max-w-[340px] pointer-events-auto">
    <div className="w-11 h-14 rounded-none overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/60">
      {product?.images?.[0]?.url && (
        <img src={product.images[0].url} className="w-full h-full object-cover mix-blend-multiply" alt="" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isRemoving ? 'text-stone-400' : 'text-[#8cb300]'}`}>
        {isRemoving ? 'Removed from Archive' : 'Asset Archived'}
      </p>
      <p className="text-[12px] font-black uppercase text-stone-900 truncate">{product?.title}</p>
    </div>
    {isRemoving ? (
      <Heart size={16} className="text-stone-300 flex-shrink-0" />
    ) : (
      <Heart size={16} className="text-red-500 fill-red-500 flex-shrink-0" />
    )}
  </div>
);

/* ─── Premium Cart Toast (White Theme) ───────────────────────── */
const CartToast = ({ product, onGoToCart }) => (
  <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[280px] max-w-[340px] pointer-events-auto">
    <div className="w-11 h-14 rounded-none overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/50">
      {product?.images?.[0]?.url && (
        <img src={product.images[0].url} className="w-full h-full object-cover mix-blend-multiply" alt="" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8cb300] mb-0.5">Added to Bag</p>
      <p className="text-[12px] font-black uppercase text-stone-900 truncate">{product?.title}</p>
    </div>
    <button
      onClick={onGoToCart}
      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
                 bg-stone-900 text-white px-3 py-2 rounded-none flex-shrink-0 hover:bg-[#ccff00] hover:text-stone-900 transition-colors shadow-md"
    >
      Bag <ArrowRight size={12} strokeWidth={2.5} />
    </button>
  </div>
);


const ProductGrid = ({ products = [], title = "Recommended Drops", limit = 4 }) => {
  const navigate = useNavigate();
  
  // 🔥 Hooks for State & APIs
  const { handleToggleWishlist, isWishlisted } = useWishlist();
  const { handleAddItem } = useCart();
  const cartItems = useSelector((state) => state.cart?.items || []);

  const randomProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }, [products, limit]);

  // 🔥 Bulletproof Cart Checker
  const checkInCart = useCallback((productId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => {
      const itemToMatch = item.product?._id || item.product || item.productId?._id || item.productId || item._id;
      return String(itemToMatch) === String(productId);
    });
  }, [cartItems]);

  // 🔥 Wishlist Toggle Logic
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

  // 🔥 Quick Add / Go To Bag Logic
  const onQuickAdd = useCallback(async (e, product) => {
    e.stopPropagation(); // Prevents navigating to product page
    
    if (checkInCart(product._id)) {
      navigate("/bag");
      return;
    }

    try {
      await handleAddItem({
        productId: product._id,
        variantId: product.variants?.[0]?._id || undefined, 
        quantity: 1,
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

        {/* GRID SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
          {randomProducts.map((product) => {
            const isOutOfStock = (product.stock || 0) === 0;
            const wishlisted = isWishlisted(product._id);
            const addedToCart = checkInCart(product._id);

            return (
              <div
                key={product._id}
                className="group flex flex-col cursor-pointer"
                onClick={() => {
                  navigate(`/product/${product._id}`);
                  window.scrollTo(0, 0); 
                }}
              >
                {/* IMAGE CONTAINER */}
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-none mb-4 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-shadow duration-500 border border-stone-200/60">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-70' : 'mix-blend-multiply'}`}
                  />

                  {/* STOCK BADGE */}
                  <div className="absolute top-3.5 left-3.5 z-20">
                    {isOutOfStock ? (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full shadow-sm">
                        Sold Out
                      </span>
                    ) : (
                      <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[9px] font-black uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full shadow-sm border border-stone-200/50">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* WISHLIST TOGGLE */}
                  <button
                    onClick={(e) => onWishlist(e, product)}
                    className={`absolute top-3.5 right-3.5 z-20 p-2.5 rounded-full shadow-sm border 
                                backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95
                                ${wishlisted ? "bg-white border-stone-200" : "bg-white/80 border-transparent hover:bg-white"}`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      size={16}
                      strokeWidth={2.5}
                      fill={wishlisted ? "currentColor" : "none"}
                      className={wishlisted ? "text-red-500" : "text-stone-400 hover:text-red-500 transition-colors"}
                    />
                  </button>

                  {/* QUICK ADD OVERLAY */}
                  {!isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 p-3.5 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                      <button 
                        onClick={(e) => onQuickAdd(e, product)}
                        className={`w-full text-[10px] sm:text-[10px] font-black uppercase py-4 tracking-[0.2em]
                                    rounded-none shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98]
                                    ${addedToCart
                                      ? "bg-[#ccff00] text-stone-900 border border-[#b3e600] hover:bg-[#b3e600]" // Go To Bag
                                      : "bg-white/95 backdrop-blur-xl text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-200/50" // Quick Add
                                    }`}
                      >
                        {addedToCart ? (
                          <><ShoppingBag size={14} strokeWidth={2.5} /> Go to Bag</>
                        ) : (
                          <><Plus size={14} strokeWidth={2.5} /> Quick Add</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* DETAILS CONTAINER */}
                <div className="flex flex-col px-1.5">
                  <h3 
                    className="text-[12px] sm:text-[13px] font-black uppercase tracking-widest text-stone-900 line-clamp-2 leading-[1.3] mb-2 min-h-[34px] transition-colors group-hover:text-stone-600"
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-bold text-stone-500">
                      {product.price?.currency} {product.price?.amount}
                    </span>
                    {product.price?.amount && (
                      <span className="text-[10px] text-stone-400 line-through font-medium">
                        {product.price.currency} {Math.round(product.price.amount * 1.5)}
                      </span>
                    )}
                  </div>

                  {/* AUTHENTIC BADGE */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                    <div className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-40 group-hover:opacity-100"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500"></span>
                    </div>
                    <span className="text-[8px] text-stone-400 font-black uppercase tracking-[0.2em] group-hover:text-stone-900 transition-colors">
                      Stylix Authentic
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;