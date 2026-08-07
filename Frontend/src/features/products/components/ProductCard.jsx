import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingBag, Plus } from "lucide-react";

export const ProductCard = ({ 
  product, 
  wishlisted, 
  onWishlist, 
  onQuickAdd, 
  addedToCart, 
  viewMode, 
  onQuickView 
}) => {
  const navigate = useNavigate();
  const [optimisticAdded, setOptimisticAdded] = useState(false);

  // Safety Fallbacks agar data corrupt/missing ho
  const safeTitle = product?.title || "Unknown Product";
  const safePrice = product?.price?.amount || "0";
  const safeCurrency = product?.price?.currency || "INR";
  const safeImage = product?.images?.[0]?.url || "https://via.placeholder.com/600x800?text=No+Image";

  useEffect(() => {
    if (addedToCart) setOptimisticAdded(true);
  }, [addedToCart]);

  const isAdded = addedToCart || optimisticAdded;

  const isOutOfStock = useMemo(() => {
    const totalStock = product?.variants?.length > 0 
      ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) 
      : (Number(product?.stock) || 0);
    return totalStock <= 0;
  }, [product]);

  const { showNewTag, showBestSeller, showTrending } = useMemo(() => {
    if (!product) return { showNewTag: false, showBestSeller: false, showTrending: false };

    const isRecentlyAdded = product.createdAt 
      ? new Date(product.createdAt).getTime() > (Date.now() - (14 * 24 * 60 * 60 * 1000)) 
      : false;

    return {
      showNewTag: Boolean(product.isNew || product.tags?.includes('new') || product.tags?.includes('NEW') || isRecentlyAdded),
      showBestSeller: Boolean(product.isBestSeller || product.tags?.includes('bestseller') || product.tags?.includes('BESTSELLER')),
      showTrending: Boolean(product.isTrending || product.tags?.includes('trending') || product.tags?.includes('TRENDING'))
    };
  }, [product]);

  const handleAction = useCallback(async (e) => {
    e.stopPropagation();
    if (isAdded) {
      navigate("/bag");
    } else {
      setOptimisticAdded(true);
      try {
        await onQuickAdd(product);
      } catch (err) {
        setOptimisticAdded(false);
      }
    }
  }, [isAdded, navigate, onQuickAdd, product]);

  const handleWishlistClick = useCallback((e) => {
    e.stopPropagation();
    onWishlist(e, product);
  }, [onWishlist, product]);

  const handleQuickViewClick = useCallback((e) => {
    e.stopPropagation();
    onQuickView(product);
  }, [onQuickView, product]);

  const handleCardClick = useCallback(() => {
    if(product?._id) navigate(`/product/${product._id}`);
  }, [navigate, product]);

  // Agar product bilkul hi invalid hai (jaise id nahi hai), toh render hi mat karo
  if (!product || !product._id) return null;

  return (
    <div
      className={`group cursor-pointer ${
        viewMode === 'list' 
          ? 'flex flex-col md:flex-row gap-6 md:gap-8 border-b border-stone-200 pb-6' 
          : 'flex flex-col'
      }`}
      onClick={handleCardClick}
    >
      {/* IMAGE WRAPPER */}
      <div className={`relative overflow-hidden bg-stone-100 border border-stone-200/60 ${
        viewMode === 'list' 
          ? 'w-full md:w-40 lg:w-48 aspect-[3/4] shrink-0' 
          : 'aspect-[3/4] mb-4'
      }`}>
        <img
          src={safeImage}
          alt={safeTitle}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            isOutOfStock ? "grayscale opacity-70" : "mix-blend-multiply"
          }`}
        />

        <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm">
              Sold Out
            </span>
          ) : (
            <>
              {showBestSeller && <span className="bg-stone-900 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm">Best Seller</span>}
              {showNewTag && <span className="bg-[#ccff00] text-stone-900 text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm border border-[#b3e600]">New</span>}
              {showTrending && <span className="bg-white text-stone-900 text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm border border-stone-200">Trending</span>}
            </>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={handleWishlistClick} className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-sm transition-all text-stone-400 hover:text-red-500">
            <Heart size={14} strokeWidth={2.5} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-red-500" : ""} />
          </button>
          <button onClick={handleQuickViewClick} className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-sm transition-all text-stone-500 hover:text-stone-900">
            <Eye size={14} strokeWidth={2.5} />
          </button>
        </div>

        {!isOutOfStock && viewMode === 'grid' && (
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 z-20" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleAction} className={`w-full text-[9px] font-black uppercase py-3 tracking-widest transition-all flex items-center justify-center gap-2 ${isAdded ? "bg-[#ccff00] text-stone-900" : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900"}`}>
              {isAdded ? <><ShoppingBag size={12} /> View Bag</> : <><Plus size={12} /> Quick Add</>}
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 py-1 pr-4 justify-between' : 'px-1'}`}>
        <div>
          <h3 className={`font-black uppercase tracking-widest text-stone-900 transition-colors group-hover:text-stone-500 ${viewMode === 'list' ? 'text-lg md:text-xl mb-2' : 'text-[11px] md:text-[13px] line-clamp-2 mb-1'}`}>
            {safeTitle}
          </h3>
          {viewMode === 'list' && (
            <p className="text-xs font-medium text-stone-500 line-clamp-3 max-w-2xl leading-relaxed">
              {product.description || "A staple piece curated for the modern wardrobe. Engineered with premium materials."}
            </p>
          )}
        </div>

        <div className={`flex ${viewMode === 'list' ? 'flex-row items-center gap-6 mt-4' : 'flex-col mt-1'}`}>
          <span className={`font-bold text-stone-900 ${viewMode === 'list' ? 'text-xl' : 'text-[12px]'}`}>
            {safeCurrency} {safePrice}
          </span>
          {viewMode === 'list' && !isOutOfStock && (
            <button onClick={handleAction} className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isAdded ? "bg-[#ccff00] text-stone-900" : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900"}`}>
              {isAdded ? <><ShoppingBag size={14} /> View Bag</> : <><Plus size={14} /> Quick Add</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};