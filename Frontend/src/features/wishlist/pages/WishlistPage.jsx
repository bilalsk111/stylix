import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // 🔥 Added useNavigate
import { Trash2, ChevronLeft } from "lucide-react"; // 🔥 Added ArrowLeft
import { getWishlistApi } from "../services/wishlist.api"; 
import { useWishlist } from "../hook/useWishList";

export const WishlistPage = () => {
  const navigate = useNavigate(); // 🔥 Hook initialize kiya
  const { handleToggleWishlist } = useWishlist();
  const [fullWishlist, setFullWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedWishlist = async () => {
      try {
        setIsLoading(true);
        const data = await getWishlistApi();
        if (data.success) {
          setFullWishlist(data.wishlist); 
        }
      } catch (error) {
        console.error("Failed to load wishlist details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedWishlist();
  }, []);

  const handleRemoveItem = (e, productId) => {
    handleToggleWishlist(e, productId);
    setFullWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-xs">Loading Archive...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] pt-32 px-6 lg:px-12 pb-24">
      <div className="max-w-[1600px] mx-auto">
        
        <div className="mb-12">
          {/* 🔥 THE BACK BUTTON */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors mb-6 group"
          >
                        <ChevronLeft size={14} strokeWidth={2.5}/> Back to Shop
          </button>

          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-stone-900">Your Archive</h1>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-2">
            {fullWishlist.length} {fullWishlist.length === 1 ? 'Asset' : 'Assets'} Secured
          </p>
        </div>

        {fullWishlist.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-stone-100">
            <h2 className="text-lg font-black uppercase tracking-widest text-stone-400 mb-6">Archive is Empty</h2>
            <Link to="/shop" className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors">
              Explore Assets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {fullWishlist.map(item => (
              <div key={item._id} className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">
                
                {/* Remove Button */}
                <button 
                  onClick={(e) => handleRemoveItem(e, item._id)}
                  className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-stone-400 hover:text-red-500 hover:border-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from Archive"
                >
                  <Trash2 size={16} />
                </button>

                <Link to={`/product/${item._id}`} className="aspect-[3/4] overflow-hidden bg-stone-100">
                  <img 
                    src={item.images?.[0]?.url || "fallback-image-url-here"} 
                    alt={item.title} 
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-[2s]"
                  />
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <Link to={`/product/${item._id}`}>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900 truncate mb-1">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-stone-500 text-[10px] font-bold mt-auto pt-4">
                    {item.price?.currency} {item.price?.amount}
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