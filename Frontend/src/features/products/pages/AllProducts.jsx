import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { LayoutGrid, SlidersHorizontal, Plus, Search, X, Heart, ShoppingBag, ArrowRight, List, ChevronDown } from "lucide-react";
import { useShopFilters } from "../hook/useShopFilters";
import FilterSidebar from "../components/FilterSidebar";
import { useWishlist } from "../../wishlist/hook/useWishList";
import { useCart } from "../../cart/hook/useCart";
import toast, { Toaster } from "react-hot-toast";

/* ─── Premium Wishlist Toast ─────── */
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

/* ─── Premium Cart Toast ───────────────────────── */
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

/* ─── Skeleton ───────────────────────────────────────────────── */
const SkeletonCard = ({ viewMode }) => (
  <div className={`animate-pulse ${viewMode === 'list' ? 'flex flex-row gap-6 border-b border-stone-200 pb-6' : 'flex flex-col gap-4'}`}>
    <div className={`bg-stone-200/50 rounded-none ${viewMode === 'list' ? 'w-32 md:w-48 aspect-[3/4] shrink-0' : 'aspect-[3/4]'}`} />
    <div className={`space-y-2.5 px-1 ${viewMode === 'list' ? 'flex-1 pt-4' : ''}`}>
      <div className="h-3 bg-stone-200/50 w-3/4 rounded-full" />
      <div className="h-3 bg-stone-200/50 w-1/3 rounded-full" />
    </div>
  </div>
);

/* ─── Product Card ──────────────────────────── */
const ProductCard = ({ product, wishlisted, onWishlist, onQuickAdd, addedToCart, viewMode }) => {
  const navigate = useNavigate();
  const isOutOfStock = (product.stock || 0) === 0;

  return (
    <div
      className={`group cursor-pointer ${viewMode === 'list' ? 'flex flex-row items-center gap-4 md:gap-8 border-b border-stone-200 pb-6' : 'flex flex-col'}`}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div
        className={`relative overflow-hidden bg-stone-100 rounded-none group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 border border-stone-200/60
                    ${viewMode === 'list' ? 'w-32 md:w-56 aspect-[3/4] mb-0 shrink-0' : 'aspect-[3/4] mb-4'}`}
      >
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-[1.5s]
                      ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105
                      ${isOutOfStock ? "grayscale opacity-70" : "mix-blend-multiply"}`}
        />

        <div className="absolute top-3 left-3 z-20">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] px-2.5 md:px-3.5 py-1.5 rounded-full shadow-sm">
              Sold Out
            </span>
          ) : (
            <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] px-2.5 md:px-3.5 py-1.5 rounded-full shadow-sm border border-stone-200/50">
              In Stock
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(e, product); }}
          className={`absolute top-3 right-3 z-20 p-2 md:p-2.5 rounded-full shadow-sm border 
                      backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95
                      ${wishlisted ? "bg-white border-stone-200" : "bg-white/80 border-transparent hover:bg-white"}`}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={14}
            strokeWidth={2.5}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-red-500" : "text-stone-400 hover:text-red-500 transition-colors"}
          />
        </button>

        {!isOutOfStock && (
          <div
            className={`absolute inset-x-0 bottom-0 p-2 md:p-3.5 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20
                        ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onQuickAdd(product)}
              className={`w-full text-[9px] md:text-[10px] font-black uppercase py-3 md:py-4 tracking-[0.2em] rounded-none shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]
                          ${addedToCart
                            ? "bg-[#ccff00] text-stone-900 border border-[#b3e600] hover:bg-[#b3e600]"
                            : "bg-white/95 backdrop-blur-xl text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-200/50"
                          }`}
            >
              {addedToCart
                ? <><ShoppingBag size={12} strokeWidth={2.5} /> Bag</>
                : <><Plus size={12} strokeWidth={2.5} /> Add</>
              }
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 justify-center' : 'px-1.5'}`}>
        <h3
          className={`font-black uppercase tracking-widest text-stone-900 leading-[1.3] transition-colors group-hover:text-stone-600
                      ${viewMode === 'list' ? 'text-sm md:text-xl mb-3' : 'text-[11px] md:text-[13px] line-clamp-2 mb-2 min-h-[34px]'}`}
          title={product.title}
        >
          {product.title}
        </h3>
        
        {viewMode === 'list' && (
           <p className="text-[11px] font-medium text-stone-500 hidden md:line-clamp-2 mb-4 max-w-xl leading-relaxed">
              {product.description || "Premium asset crafted for structural longevity and supreme fit."}
           </p>
        )}

        <div className="flex items-center gap-3">
          <span className={`${viewMode === 'list' ? 'text-sm md:text-lg' : 'text-[12px] md:text-[13px]'} font-bold text-stone-900`}>
            {product.price?.currency} {product.price?.amount}
          </span>
          {product.price?.amount && (
            <span className={`${viewMode === 'list' ? 'text-xs' : 'text-[10px]'} text-stone-400 line-through font-medium`}>
              {product.price.currency} {Math.round(product.price.amount * 1.5)}
            </span>
          )}
        </div>
        
        {/* Quick Add for List View Mobile */}
        {viewMode === 'list' && !isOutOfStock && (
          <button 
            onClick={(e) => { e.stopPropagation(); onQuickAdd(product); }}
            className={`mt-4 w-fit px-6 py-2.5 text-[9px] font-black uppercase tracking-widest border transition-colors md:hidden
                        ${addedToCart ? "bg-[#ccff00] border-[#b3e600] text-stone-900" : "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"}`}
          >
            {addedToCart ? "In Bag" : "Quick Add"}
          </button>
        )}
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
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    const t = setTimeout(() => updateFilter("search", localSearch), 500);
    return () => clearTimeout(t);
  }, [localSearch, updateFilter]);

  const handleClearFilters = () => { setLocalSearch(""); navigate("/shop"); };

  const checkInCart = useCallback((productId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => {
      const itemToMatch = item.product?._id || item.product || item.productId?._id || item.productId || item._id;
      return String(itemToMatch) === String(productId);
    });
  }, [cartItems]);

  const onWishlist = useCallback((e, product) => {
    const wasWishlisted = isWishlisted(product._id);
    handleToggleWishlist(e, product._id);
    toast.custom((t) => <WishlistToast product={product} isRemoving={wasWishlisted} />, {
      position: "bottom-center", duration: 2500, id: `wishlist-${product._id}`
    });
  }, [handleToggleWishlist, isWishlisted]);

  const onQuickAdd = useCallback(async (product) => {
    if (checkInCart(product._id)) { navigate("/bag"); return; }
    try {
      await handleAddItem({ productId: product._id, variantId: product.variants?.[0]?._id || undefined, quantity: 1 });
      toast.custom(
        (t) => <CartToast product={product} onGoToCart={() => { toast.dismiss(t.id); navigate("/bag"); }} />,
        { position: "bottom-center", duration: 3500, id: `cart-${product._id}` }
      );
    } catch (err) {
      console.error("Quick add failed:", err);
      toast.error("Couldn't add to bag.", { position: "bottom-center" });
    }
  }, [checkInCart, handleAddItem, navigate]);

  const gridCols = viewMode === "grid" 
    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12 md:gap-y-16"
    : "flex flex-col gap-y-6 md:gap-y-8";

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-[#ccff00] selection:text-stone-900">
      
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
          <h1 className="text-6xl md:text-[8rem] lg:text-[11rem] font-black uppercase tracking-tighter leading-[0.85] mb-8 text-stone-900 break-words">
            New <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #1c1917" }}>Arrivals</span>
          </h1>
          <p className="max-w-xl text-stone-500 text-[12px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-12">
            A curated index of precision-cut garments. Limited availability per drop. Secure your assets.
          </p>
        </header>

        {/* ─── PREMIUM TOOLBAR MATCHING SCREENSHOTS ─── */}
        <div className="mb-10 z-40 relative">
          
          {/* Mobile Search */}
          <div className="md:hidden relative w-full flex items-center border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors duration-300 pb-2 mb-6">
            <Search size={18} className="text-stone-400 mr-3" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="SEARCH COLLECTION..."
              className="w-full bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-[0.2em] text-stone-900 placeholder-stone-400"
            />
            {localSearch && (
              <button onClick={() => setLocalSearch("")} className="text-stone-400 hover:text-stone-900 ml-2">
                <X size={16} strokeWidth={3} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-stone-200/50 pb-6">
            
            <div className="w-full md:flex-1 md:max-w-md flex items-center justify-between gap-4">
              
              {/* MOBILE: Filters Button + Dropdown Row */}
              <div className="flex md:hidden items-center gap-3 w-full">
                <button onClick={() => setIsFilterOpen(true)} className="flex-1 flex items-center justify-center gap-2 border border-stone-200 bg-white px-4 py-3.5 rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-stone-50">
                  <SlidersHorizontal size={14} /> Filters
                </button>
                
                <div className="relative flex-1">
                  <select 
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); updateFilter("sort", e.target.value); }}
                    className="w-full appearance-none border border-stone-200 bg-white px-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-stone-900 rounded-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price Low-High</option>
                    <option value="price_desc">Price High-Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
                </div>
              </div>

              {/* DESKTOP: Search */}
              <div className="hidden md:flex relative w-full items-center group border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors duration-300 pb-2">
                <Search size={20} className="text-stone-400 group-focus-within:text-stone-900 transition-colors mr-4" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="SEARCH COLLECTION..."
                  className="w-full bg-transparent border-none outline-none text-[12px] font-black uppercase tracking-[0.2em] text-stone-900 placeholder-stone-400"
                />
                {localSearch && (
                  <button onClick={() => setLocalSearch("")} className="text-stone-400 hover:text-stone-900 transition-colors ml-2 active:scale-90">
                    <X size={18} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP: Right Side Controls (Sort & View Toggles) */}
            <div className="hidden md:flex items-center gap-6">
              <div className="relative w-48">
                <select 
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); updateFilter("sort", e.target.value); }}
                  className="w-full appearance-none border border-stone-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-stone-900 rounded-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-900" />
              </div>

              <div className="flex items-center border border-stone-200 rounded-none bg-white h-full">
                <button onClick={() => setViewMode('grid')} className={`p-3 transition-colors h-full ${viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`}>
                  <LayoutGrid size={16} strokeWidth={2.5} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-3 transition-colors border-l border-stone-200 h-full ${viewMode === 'list' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`}>
                  <List size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            {pagination?.totalProducts ?? products.length} Results
          </div>
        </div>

        {/* ─── LAYOUT: SIDEBAR + PRODUCT GRID ─── */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-start relative">
          
          {/* Desktop Left Sidebar (Always Visible) */}
          <div className="hidden md:block w-[240px] lg:w-[260px] shrink-0 sticky top-[100px]">
            <FilterSidebar
              searchParams={searchParams}
              updateFilter={updateFilter}
              closeSidebar={() => {}} 
            />
          </div>

          {/* Mobile Filter Drawer (Slide Out) */}
          {isFilterOpen && (
            <div className="md:hidden fixed inset-0 z-[100] flex">
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
              <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-white sticky top-0 z-10">
                  <span className="text-[13px] font-black uppercase tracking-[0.2em] text-stone-900">Filters</span>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 border border-stone-200 rounded-full">
                    <X size={16} strokeWidth={2.5}/>
                  </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                  <FilterSidebar
                    searchParams={searchParams}
                    updateFilter={updateFilter}
                    closeSidebar={() => setIsFilterOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Product Feed */}
          <div className="flex-1 w-full min-h-[50vh]">
            {isLoading && products.length === 0 && (
              <div className={gridCols}>
                {[...Array(10)].map((_, i) => <SkeletonCard key={i} viewMode={viewMode} />)}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-none bg-white/50">
                <p className="text-stone-400 text-[12px] uppercase tracking-[0.4em] font-black mb-6">No Assets Found</p>
                <button onClick={handleClearFilters}
                  className="text-[11px] font-black uppercase bg-stone-900 text-white px-8 py-4 rounded-none tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-colors active:scale-95 shadow-lg">
                  Clear All Filters
                </button>
              </div>
            )}

            {products.length > 0 && (
              <>
                <div className={`${gridCols} transition-opacity duration-500 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      wishlisted={isWishlisted(product._id)}
                      onWishlist={onWishlist}
                      onQuickAdd={onQuickAdd}
                      addedToCart={checkInCart(product._id)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {pagination?.totalPages > 1 && (
                  <div className="mt-24 mb-10 flex justify-center items-center gap-4 md:gap-6 border-t border-stone-200/60 pt-12">
                    <button
                      disabled={pagination.currentPage === 1}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        updateFilter("page", pagination.currentPage - 1);
                      }}
                      className="px-6 md:px-8 py-4 border border-stone-200 rounded-none text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-30 hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all active:scale-95"
                    >
                      Prev
                    </button>
                    <span className="px-6 py-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-stone-500 bg-white rounded-none shadow-sm border border-stone-100">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        updateFilter("page", pagination.currentPage + 1);
                      }}
                      className="px-6 md:px-8 py-4 border border-stone-200 rounded-none text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black disabled:opacity-30 hover:bg-stone-900 hover:border-stone-900 hover:text-white transition-all active:scale-95"
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