import React, { useState, useEffect } from "react";
import { X, Heart, ArrowRight, ShoppingBag, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickViewModal = ({ product, isOpen, onClose, onQuickAdd, wishlisted, onWishlist, addedToCart }) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Extract unique colors and sizes from variants
  const colors = [...new Set(product?.variants?.map(v => v.attributes?.COLOR).filter(Boolean))] || [];
  const sizes = [...new Set(product?.variants?.map(v => v.attributes?.SIZE).filter(Boolean))] || [];

  // Reset selections when a new product opens
  useEffect(() => {
    if (product) {
      setSelectedColor(colors[0] || "");
      setSelectedSize(sizes[0] || "");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleCartAction = () => {
    // Agar pehle se cart mein hai, toh seedha Bag page par le jao
    if (addedToCart) {
      navigate("/bag");
      onClose(); // Navigate karne par modal band kar do
    } else {
      // Agar cart mein nahi hai, toh add karo (Modal band NAHI hoga yahan)
      if (sizes.length > 0 && !selectedSize) return alert("Please select a size first.");
      onQuickAdd(product, selectedSize, selectedColor);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[900px] flex flex-col md:flex-row bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-50 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* 🖼️ IMAGE SECTION */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-stone-100 relative border-b md:border-b-0 md:border-r border-stone-200">
          <img 
            src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"} 
            alt={product.title} 
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>

        {/* 📝 DETAILS SECTION (LIGHT THEME) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col text-stone-900 h-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="mb-8">
            <span className="text-[10px] text-stone-400 font-black tracking-[0.3em] uppercase mb-3 block">
              {product.subCategory || "Apparel"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 leading-tight text-stone-900">
              {product.title}
            </h2>
            <div className="text-xl font-bold text-stone-900">
              {product.price?.currency || 'INR'} {product.price?.amount}
            </div>
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mb-6">
              <span className="text-[9px] text-stone-400 font-black tracking-widest uppercase mb-3 block">Color —</span>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2.5 text-[9px] font-black tracking-widest uppercase transition-all border ${
                      selectedColor === color 
                        ? "border-stone-900 bg-stone-900 text-white" 
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-8">
              <span className="text-[9px] text-stone-400 font-black tracking-widest uppercase mb-3 block">Size —</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] h-10 px-3 flex items-center justify-center text-[10px] font-black tracking-widest uppercase transition-all border ${
                      selectedSize === size 
                        ? "border-stone-900 bg-stone-900 text-white" 
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-6">
            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={handleCartAction}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart 
                    ? "bg-[#ccff00] text-stone-900 border border-[#b3e600]" 
                    : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900"
                }`}
              >
                {product.stock === 0 ? "Out of Stock" : (
                  addedToCart ? <><ShoppingBag size={14} /> View Bag</> : <><Plus size={14} /> Add to Bag</>
                )}
              </button>
              
              <button 
                onClick={(e) => onWishlist(e, product)}
                className={`w-14 flex items-center justify-center border transition-all ${
                  wishlisted 
                    ? "border-red-200 bg-red-50 text-red-500" 
                    : "border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"
                }`}
              >
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* View Full Details Link */}
            <button 
              onClick={() => { navigate(`/product/${product._id}`); onClose(); }}
              className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors flex items-center gap-2"
            >
              View Full Details <ArrowRight size={12} />
            </button>
          </div>

        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
};