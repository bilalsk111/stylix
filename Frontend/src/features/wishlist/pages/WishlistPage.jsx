import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; 
import { Trash2, ChevronLeft } from "lucide-react"; 
import { getWishlistApi } from "../services/wishlist.api"; 
import { useWishlist } from "../hook/useWishList";

//Stable Memory Reference for empty state
const EMPTY_WISHLIST = [];

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { handleToggleWishlist } = useWishlist();
  
  //  Check Redux cache first to render instantly in 0ms
  const cachedWishlist = useSelector((state) => state.wishlist?.items || EMPTY_WISHLIST);
  
  const [fullWishlist, setFullWishlist] = useState(cachedWishlist);
  const [isLoading, setIsLoading] = useState(() => fullWishlist.length === 0);

  useEffect(() => {
    let isMounted = true;

    const fetchDetailedWishlist = async () => {
      try {
        // Show loader ONLY if we have absolutely 0 data in cache
        if (fullWishlist.length === 0) {
          setIsLoading(true);
        }
        
        const data = await getWishlistApi(); // Background silent fetch
        
        if (isMounted && data.success) {
          setFullWishlist(data.wishlist); 
        }
      } catch (error) {
        console.error("Failed to load wishlist details", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetailedWishlist();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveItem = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleWishlist(e, productId);
    // Optimistic UI Removal
    setFullWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] pt-32 px-6 lg:px-12 pb-24 selection:bg-[#ccff00] selection:text-stone-900">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="mb-12">
          {/* THE BACK BUTTON */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors mb-6 group w-fit"
          >
            <ChevronLeft size={14} strokeWidth={2.5}/> Back to Shop
          </button>

          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-stone-900">Your Archive</h1>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-2">
            {fullWishlist.length} {fullWishlist.length === 1 ? 'Asset' : 'Assets'} Secured
          </p>
        </div>

        {/*  Inline Skeleton only when fetching first time */}
        {isLoading && fullWishlist.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] bg-stone-200/60 animate-pulse border border-stone-100 w-full" />
                <div className="h-4 bg-stone-200/60 animate-pulse w-3/4" />
                <div className="h-3 bg-stone-200/60 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : fullWishlist.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-none border border-stone-100 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-widest text-stone-400 mb-6">Archive is Empty</h2>
            <Link to="/shop" className="bg-stone-900 text-white px-8 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ccff00] hover:text-stone-900 transition-all duration-300 shadow-md">
              Explore Assets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {fullWishlist.map(item => (
              <div key={item._id} className="group relative bg-white rounded-none overflow-hidden border border-stone-100 shadow-sm flex flex-col hover:border-stone-300 transition-colors">
                
                {/* Remove Button */}
                <button 
                  onClick={(e) => handleRemoveItem(e, item._id)}
                  className="absolute top-3 right-3 z-10 p-2.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-stone-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
                  title="Remove from Archive"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>

                <Link to={`/product/${item._id}`} className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                  <img 
                    src={item.images?.[0]?.url || "https://via.placeholder.com/600x800?text=No+Image"} 
                    alt={item.title} 
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <Link to={`/product/${item._id}`}>
                    <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-stone-900 truncate mb-1 group-hover:text-stone-500 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-stone-900 text-[11px] font-black mt-auto pt-3">
                    {item.price?.currency || "INR"} {item.price?.amount || "0"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};