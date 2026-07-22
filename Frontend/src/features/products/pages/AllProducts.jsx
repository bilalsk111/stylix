import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { LayoutGrid, SlidersHorizontal, Plus, Search, X, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useShopFilters } from "../hook/useShopFilters";
import FilterSidebar from "../components/FilterSidebar";
import { useWishlist } from "../../wishlist/hook/useWishList";
import { useCart } from "../../cart/hook/useCart";
import toast, { Toaster } from "react-hot-toast"; // 🔥 Toaster import kiya yahan

/* ─── Premium Wishlist Toast (Handles Both Add & Remove) ─────── */
const WishlistToast = ({ product, isRemoving }) => (
  <div className="flex items-center gap-4 bg-white border border-stone-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[280px] max-w-[340px] pointer-events-auto">
    <div className="w-11 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/60">
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
  <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] px-4 py-3 min-w-[280px] max-w-[340px] pointer-events-auto">
    <div className="w-11 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/50">
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
                 bg-stone-900 text-white px-3 py-2 rounded-xl flex-shrink-0 hover:bg-[#ccff00] hover:text-stone-900 transition-colors shadow-md"
    >
      Bag <ArrowRight size={12} strokeWidth={2.5} />
    </button>
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="aspect-[3/4] bg-stone-200/50 rounded-2xl" />
    <div className="space-y-2.5 px-1">
      <div className="h-3 bg-stone-200/50 w-3/4 rounded-full" />
      <div className="h-3 bg-stone-200/50 w-1/3 rounded-full" />
    </div>
  </div>
);

/* ─── Product Card (Polished UI/UX) ──────────────────────────── */
const ProductCard = ({ product, wishlisted, onWishlist, onQuickAdd, addedToCart }) => {
  const navigate = useNavigate();
  const isOutOfStock = (product.stock || 0) === 0;

  return (
    <div
      className="group flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-[1.25rem] mb-4
                   group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500
                   border border-stone-200/60"
      >
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-[1.5s]
                      ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105
                      ${isOutOfStock ? "grayscale opacity-70" : "mix-blend-multiply"}`}
        />

        {/* Top Badges */}
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

        {/* Wishlist Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(e, product); }}
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

        {/* Refined Quick Add Tray */}
        {!isOutOfStock && (
          <div
            className="absolute inset-x-0 bottom-0 p-3.5 translate-y-[120%] group-hover:translate-y-0
                       transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onQuickAdd(product)}
              className={`w-full text-[10px] font-black uppercase py-4 tracking-[0.2em]
                          rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98]
                          ${addedToCart
                            ? "bg-[#ccff00] text-stone-900 border border-[#b3e600] hover:bg-[#b3e600]" // Go To Bag Style
                            : "bg-white/95 backdrop-blur-xl text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-200/50" // Quick Add Style
                          }`}
            >
              {addedToCart
                ? <><ShoppingBag size={14} strokeWidth={2.5} /> Go to Bag</>
                : <><Plus size={14} strokeWidth={2.5} /> Quick Add</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col px-1.5">
        <h3
          className="text-[13px] font-black uppercase tracking-widest text-stone-900
                     line-clamp-2 leading-[1.3] mb-2 min-h-[34px] transition-colors group-hover:text-stone-600"
          title={product.title}
        >
          {product.title}
        </h3>
        <span className="text-[13px] font-bold text-stone-500">
          {product.price?.currency} {product.price?.amount}
        </span>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const AllProducts = () => {
  const navigate = useNavigate();
  const { searchParams, updateFilter, products, pagination, isLoading } = useShopFilters();
  const { handleToggleWishlist, isWishlisted } = useWishlist();
  const { handleAddItem } = useCart();
  
  const cartItems = useSelector((state) => state.cart?.items || []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => updateFilter("search", localSearch), 500);
    return () => clearTimeout(t);
  }, [localSearch, updateFilter]);

  const handleClearFilters = () => { setLocalSearch(""); navigate("/shop"); };

  // Bulletproof Cart Checker
  const checkInCart = useCallback((productId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => {
      const itemToMatch = item.product?._id || item.product || item.productId?._id || item.productId || item._id;
      return String(itemToMatch) === String(productId);
    });
  }, [cartItems]);

  /* ── Wishlist toggle (Now shows Add AND Remove toast) ── */
  const onWishlist = useCallback((e, product) => {
    const wasWishlisted = isWishlisted(product._id);
    
    // Updates Redux/Backend
    handleToggleWishlist(e, product._id);

    // Show Toast (dynamically handles added/removed state)
    toast.custom((t) => <WishlistToast product={product} isRemoving={wasWishlisted} />, {
      position: "bottom-center",
      duration: 2500,
      id: `wishlist-${product._id}` // Prevents stacking identical toasts
    });
  }, [handleToggleWishlist, isWishlisted]);

  /* ── Quick add to cart ── */
  const onQuickAdd = useCallback(async (product) => {
    // Navigate directly if already in cart
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

      // Show White Theme Cart Toast
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

  const gridCols = `grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-16 ${
    isFilterOpen ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-4 xl:grid-cols-5"
  }`;

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans
                    [&::selection]:bg-[#ccff00] [&::selection]:text-stone-900
                    [&_*::selection]:bg-[#ccff00] [&_*::selection]:text-stone-900">
      
      {/* 🔥 MAIN FIX: Add Toaster component here so toasts actually render on this page */}
      <Toaster position="bottom-center" reverseOrder={false} />

      <main className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-24">

        {/* Hero */}
        <header className="mb-14">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-[2px] w-12 bg-[#ccff00]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
              The Archive / Vol. 04
            </h2>
          </div>
          <h1 className="text-6xl md:text-[8rem] lg:text-[11rem] font-black uppercase tracking-tighter leading-[0.85] mb-8 text-stone-900">
            New <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #1c1917" }}>Arrivals</span>
          </h1>
          <p className="max-w-xl text-stone-500 text-[12px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-12">
            A curated index of precision-cut garments. Limited availability per drop. Secure your assets.
          </p>
        </header>

        {/* Toolbar */}
        <div className="py-6 mb-12 z-40 bg-[#f7f6f4]/95 backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 w-full border-b border-stone-200/50 pb-6">
            <div className="relative flex-1 w-full max-w-2xl flex items-center group
                            border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors duration-300 pb-2">
              <Search size={20} className="text-stone-400 group-focus-within:text-stone-900 transition-colors mr-4" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="SEARCH COLLECTION..."
                className="w-full bg-transparent border-none outline-none text-[12px] font-black uppercase
                           tracking-[0.2em] text-stone-900 placeholder-stone-400 focus:placeholder-stone-300"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch("")} className="text-stone-400 hover:text-stone-900 transition-colors ml-2 active:scale-90">
                  <X size={18} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-8 shrink-0 pb-2 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={() => setIsFilterOpen(v => !v)}
                className={`flex items-center gap-3 transition-all duration-300 active:scale-95 ${isFilterOpen ? "text-stone-900" : "text-stone-400 hover:text-stone-900"}`}
              >
                <SlidersHorizontal size={16} />
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                  {isFilterOpen ? "Close Filters" : "Filters"}
                </span>
              </button>
              <div className="flex items-center gap-3">
                <LayoutGrid size={16} className="text-stone-900" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-stone-900">
                  {pagination?.totalProducts ?? products.length} Assets
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {isFilterOpen && (
            <div className="w-full md:w-[280px] shrink-0 sticky top-[180px] animate-in fade-in slide-in-from-left-4 duration-300">
              <FilterSidebar
                searchParams={searchParams}
                updateFilter={updateFilter}
                closeSidebar={() => setIsFilterOpen(false)}
              />
            </div>
          )}

          <div className="flex-1 w-full min-h-[50vh]">
            {isLoading && products.length === 0 && (
              <div className={gridCols}>
                {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-[2rem] bg-white/50">
                <p className="text-stone-400 text-[12px] uppercase tracking-[0.4em] font-black mb-6">No Assets Found</p>
                <button onClick={handleClearFilters}
                  className="text-[11px] font-black uppercase bg-stone-900 text-white px-8 py-4 rounded-xl tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-colors active:scale-95 shadow-lg">
                  Clear All Filters
                </button>
              </div>
            )}

            {products.length > 0 && (
              <>
                <div className={`${gridCols} transition-all duration-500 ${isLoading ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100 blur-0"}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlisted={isWishlisted(product._id)}
                      onWishlist={onWishlist}
                      onQuickAdd={onQuickAdd}
                      addedToCart={checkInCart(product._id)}
                    />
                  ))}
                </div>

                {pagination?.totalPages > 1 && (
                  <div className="mt-24 mb-10 flex justify-center items-center gap-6 border-t border-stone-200/60 pt-12">
                    <button
                      disabled={pagination.currentPage === 1}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        updateFilter("page", pagination.currentPage - 1);
                      }}
                      className="px-8 py-4 border border-stone-200 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-30 hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all active:scale-95"
                    >
                      Previous
                    </button>
                    <span className="px-6 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-stone-500 bg-white rounded-xl shadow-sm border border-stone-100">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        updateFilter("page", pagination.currentPage + 1);
                      }}
                      className="px-8 py-4 border border-stone-200 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-30 hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all active:scale-95"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllProducts;