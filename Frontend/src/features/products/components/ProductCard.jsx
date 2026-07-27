import React, { useState, useEffect } from "react";
import { QuickViewModal } from "../components/QuickViewModal";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, ShoppingBag, Plus } from "lucide-react";

export const ProductCard = ({ product, wishlisted, onWishlist, onQuickAdd, addedToCart, viewMode, onQuickView }) => {
  const navigate = useNavigate();
  const [optimisticAdded, setOptimisticAdded] = useState(false);

  // 🔥 FIXED STOCK LOGIC
  const totalStock = product?.variants?.length > 0 
    ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) 
    : (Number(product?.stock) || 0);
    
  const isOutOfStock = totalStock <= 0;
  
  const isAdded = addedToCart || optimisticAdded;

  // 🔥 ROBUST TAG LOGIC (Checks Boolean, Tags Array, and Created Date)
  // New Tag: True if added in the last 14 days
  const isRecentlyAdded = product.createdAt 
    ? new Date(product.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
    : false;
    
  const showNewTag = product.isNew || product.tags?.includes('new') || product.tags?.includes('NEW') || isRecentlyAdded;
  const showBestSeller = product.isBestSeller || product.tags?.includes('bestseller') || product.tags?.includes('BESTSELLER');
  const showTrending = product.isTrending || product.tags?.includes('trending') || product.tags?.includes('TRENDING');

  useEffect(() => {
    if (addedToCart) {
      setOptimisticAdded(true);
    }
  }, [addedToCart]);

  const handleAction = async (e) => {
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
  };

  return (
    <div
      className={`group cursor-pointer ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-6 md:gap-8 border-b border-stone-200 pb-6' : 'flex flex-col'}`}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* 🖼️ IMAGE WRAPPER */}
      <div className={`relative overflow-hidden bg-stone-100 border border-stone-200/60 ${viewMode === 'list' ? 'w-full md:w-40 lg:w-48 aspect-[3/4] shrink-0' : 'aspect-[3/4] mb-4'}`}>
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-70" : "mix-blend-multiply"}`}
        />

        {/* 🔥 DYNAMIC TAGS */}
        <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm">
              Sold Out
            </span>
          ) : (
            <>
              {showBestSeller && (
                <span className="bg-stone-900 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm">
                  Best Seller
                </span>
              )}
              {showNewTag && (
                <span className="bg-[#ccff00] text-stone-900 text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm border border-[#b3e600]">
                  New
                </span>
              )}
              {showTrending && (
                <span className="bg-white text-stone-900 text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 shadow-sm border border-stone-200">
                  Trending
                </span>
              )}
            </>
          )}
        </div>

        {/* 🛠️ Action Icons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onWishlist(e, product); }}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-sm transition-all text-stone-400 hover:text-red-500"
          >
            <Heart size={14} strokeWidth={2.5} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-red-500" : ""} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white shadow-sm transition-all text-stone-500 hover:text-stone-900"
          >
            <Eye size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* 🛒 Grid View Cart Overlay Button */}
        {!isOutOfStock && viewMode === 'grid' && (
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 z-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAction}
              className={`w-full text-[9px] font-black uppercase py-3 tracking-widest transition-all flex items-center justify-center gap-2 ${
                isAdded ? "bg-[#ccff00] text-stone-900" : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900"
              }`}
            >
              {isAdded ? <><ShoppingBag size={12} /> View Bag</> : <><Plus size={12} /> Quick Add</>}
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 py-1 pr-4 justify-between' : 'px-1'}`}>
        <div>
          <h3 className={`font-black uppercase tracking-widest text-stone-900 transition-colors group-hover:text-stone-500 ${viewMode === 'list' ? 'text-lg md:text-xl mb-2' : 'text-[11px] md:text-[13px] line-clamp-2 mb-1'}`}>
            {product.title}
          </h3>
          {viewMode === 'list' && (
            <p className="text-xs font-medium text-stone-500 line-clamp-3 max-w-2xl leading-relaxed">
              {product.description || "A staple piece curated for the modern wardrobe. Engineered with premium materials."}
            </p>
          )}
        </div>

        <div className={`flex ${viewMode === 'list' ? 'flex-row items-center gap-6 mt-4' : 'flex-col mt-1'}`}>
          <span className={`font-bold text-stone-900 ${viewMode === 'list' ? 'text-xl' : 'text-[12px]'}`}>
            {product.price?.currency || 'INR'} {product.price?.amount}
          </span>
          {viewMode === 'list' && !isOutOfStock && (
            <button
              onClick={handleAction}
              className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isAdded ? "bg-[#ccff00] text-stone-900" : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900"
              }`}
            >
              {isAdded ? <><ShoppingBag size={14} /> View Bag</> : <><Plus size={14} /> Quick Add</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};