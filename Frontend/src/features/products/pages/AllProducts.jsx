import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LayoutGrid, SlidersHorizontal, Search, X, List, ChevronDown } from "lucide-react";
import { useShopFilters } from "../hook/useShopFilters";
import FilterSidebar from "../components/FilterSidebar";
import { useWishlist } from "../../wishlist/hook/useWishList";
import { useCart } from "../../cart/hook/useCart";
import toast, { Toaster } from "react-hot-toast";

// Import your newly created components
import { WishlistToast } from "../components/WishlistToast";
import { CartToast } from "../components/CartToast";
import { SkeletonCard } from "../components/SkeletonCard";
import { ProductCard } from "../components/ProductCard";
import { QuickViewModal } from "../components/QuickViewModal";

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
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => updateFilter("search", localSearch), 500);
    return () => clearTimeout(t);
  }, [localSearch, updateFilter]);

  const handleClearFilters = () => { setLocalSearch(""); navigate("/shop"); };

  const checkInCart = useCallback((productId) => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => String(item.product?._id || item.productId || item._id) === String(productId));
  }, [cartItems]);

  const onWishlist = useCallback((e, product) => {
    if (!product?._id) return;

    // 1. Prevent event bubbling so clicking the heart doesn't trigger the product card link
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyWishlisted = isWishlisted(product._id);

    // 2. Optimistic UI Update: Fire toast instantly with unique ID
    toast.custom(
      (t) => <WishlistToast product={product} isRemoving={isCurrentlyWishlisted} />,
      { position: "bottom-center", duration: 2000, id: `wishlist-${product._id}` }
    );

    // 3. Trigger state/API update
    handleToggleWishlist(e, product._id);
  }, [handleToggleWishlist, isWishlisted]);

  const onQuickAdd = useCallback(async (product, selectedSize = null, selectedColor = null) => {
    if (!product?._id) return;

    // 1. Return immediately if already in cart
    if (checkInCart(product._id)) {
      navigate("/bag");
      return;
    }

    // 2. Optimistic UI Update: Fire toast instantly with a unique ID to prevent spam
    const toastId = `cart-${product._id}`;
    toast.custom(
      (t) => (
        <CartToast
          product={product}
          onGoToCart={() => {
            toast.dismiss(t.id);
            navigate("/bag");
          }}
        />
      ),
      { position: "bottom-center", duration: 3000, id: toastId }
    );

    // 3. API Call executes in the background
    try {
      await handleAddItem({
        productId: product._id,
        variantId: product.variants?.[0]?._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor
      });
    } catch (err) {
      // 4. Rollback UI if API fails
      toast.dismiss(toastId);
      toast.error("Failed to add to bag. Please try again.", { position: "bottom-center" });
      console.error("Cart Add Error:", err);
    }
  }, [checkInCart, handleAddItem, navigate]);

  const gridCols = viewMode === "grid"
    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10"
    : "flex flex-col gap-y-10";

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-[#ccff00] selection:text-stone-900">
      <Toaster position="bottom-center" />

      <main className="max-w-[1800px] mx-auto px-6 md:px-12 pt-28 pb-20">

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
        {/* Clean Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-stone-900">
            Catalog.
          </h1>
        </header>

        {/* Toolbar */}
        <div className="mb-8 border-b border-stone-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          {/* Search Box */}
          <div className="relative w-full md:w-80 flex items-center border-b-2 border-stone-300 focus-within:border-stone-900 pb-1">
            <Search size={16} className="text-stone-400 mr-2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="SEARCH PRODUCT..."
              className="w-full bg-transparent outline-none text-[11px] font-black uppercase tracking-widest text-stone-900 placeholder-stone-400"
            />
            {localSearch && <X size={14} className="cursor-pointer" onClick={() => setLocalSearch("")} />}
          </div>

          {/* Sort & Controls */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <button onClick={() => setIsFilterOpen(true)} className="md:hidden flex items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase">
              <SlidersHorizontal size={12} /> Filters
            </button>

            <div className="relative w-44">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); updateFilter("sort", e.target.value); }}
                className="w-full appearance-none border border-stone-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-stone-900 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending Now</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-900" />
            </div>

            <div className="hidden md:flex border border-stone-200 bg-white">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-stone-100' : ''}`}><LayoutGrid size={14} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 border-l ${viewMode === 'list' ? 'bg-stone-100' : ''}`}><List size={14} /></button>
            </div>
          </div>
        </div>

        {/* Sidebar + Grid Layout */}
        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Desktop Left Sidebar */}
          <div className="hidden md:block w-60 shrink-0 sticky top-24">
            <FilterSidebar closeSidebar={() => { }} />
          </div>

          {/* Mobile Slide Drawer */}
          {isFilterOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-stone-900/50" onClick={() => setIsFilterOpen(false)} />
              <div className="relative w-80 bg-white h-full p-6 overflow-y-auto z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                  <X size={18} className="cursor-pointer" onClick={() => setIsFilterOpen(false)} />
                </div>
                <FilterSidebar closeSidebar={() => setIsFilterOpen(false)} />
              </div>
            </div>
          )}

          {/* Product Feed */}
          <div className="flex-1 w-full">
            {isLoading && products.length === 0 && (
              <div className={gridCols}>
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} viewMode={viewMode} />)}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="h-60 flex flex-col items-center justify-center border border-dashed border-stone-300">
                <p className="text-stone-400 text-[11px] uppercase tracking-widest font-black mb-4">No Products Found</p>
                <button onClick={handleClearFilters} className="text-[10px] font-black uppercase bg-stone-900 text-white px-6 py-3 tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}

            {products.length > 0 && (
              <div className={gridCols}>
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    wishlisted={isWishlisted(product._id)}
                    onWishlist={onWishlist}
                    onQuickAdd={onQuickAdd}
                    addedToCart={checkInCart(product._id)}
                    viewMode={viewMode}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}

            <QuickViewModal
              product={quickViewProduct}
              isOpen={!!quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
              onQuickAdd={onQuickAdd}
              wishlisted={quickViewProduct ? isWishlisted(quickViewProduct._id) : false}
              onWishlist={onWishlist}
              addedToCart={quickViewProduct ? checkInCart(quickViewProduct._id) : false}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default AllProducts;