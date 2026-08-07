import React, { useState, useEffect } from "react";
import { X, Heart, ArrowRight, ShoppingBag, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const QuickViewModal = ({ product, isOpen, onClose, onQuickAdd, wishlisted, onWishlist, addedToCart }) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [optimisticAdded, setOptimisticAdded] = useState(false);

  //  FIXED STOCK LOGIC
  const totalStock = product?.variants?.length > 0
    ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : (Number(product?.stock) || 0);

  const colors = [...new Set(product?.variants?.map(v => v.attributes?.COLOR).filter(Boolean))] || [];
  const sizes = [...new Set(product?.variants?.map(v => v.attributes?.SIZE).filter(Boolean))] || [];
  const isAdded = addedToCart || optimisticAdded;

  useEffect(() => {
    if (product) {
      setSelectedColor(colors[0] || "");
      setSelectedSize(sizes[0] || "");
      setOptimisticAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleCartAction = async () => {
    if (isAdded) {
      navigate("/bag");
      onClose();
    } else {
      if (sizes.length > 0 && !selectedSize) {
        toast.error("Please select a size first", { position: "bottom-center" });
        return;
      }
      setOptimisticAdded(true);
      try {
        await onQuickAdd(product, selectedSize, selectedColor);
      } catch (error) {
        setOptimisticAdded(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[900px] max-h-[90vh] md:h-[550px] flex flex-col md:flex-row bg-white shadow-2xl overflow-hidden border border-stone-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-stone-500 bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm hover:text-stone-900 hover:bg-white rounded-full transition-all">
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="w-full md:w-1/2 h-[350px] md:h-full bg-stone-100 relative shrink-0 border-b md:border-b-0 md:border-r border-stone-200">
          <img src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
        </div>

        <div className="w-full md:w-1/2 h-full p-6 md:p-8 flex flex-col text-stone-900 overflow-y-auto custom-scrollbar">
          <div className="mb-5 pr-8">
            <span className="text-[10px] text-stone-500 font-black tracking-[0.2em] uppercase mb-1.5 block">{product.brand || "Stylix"}</span>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest mb-2 leading-snug text-stone-900 line-clamp-3">{product.title}</h2>
            <div className="text-lg font-bold text-stone-900">{product.price?.currency || 'INR'} {product.price?.amount}</div>
          </div>

          {colors.length > 0 && (
            <div className="mb-5">
              <span className="text-[9px] text-stone-400 font-black tracking-widest uppercase mb-2 block">Color —</span>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all border ${selectedColor === color ? "border-stone-900 bg-stone-900 text-white shadow-md" : "border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900"}`}>{color}</button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-4">
              <span className="text-[9px] text-stone-400 font-black tracking-widest uppercase mb-2 block">Size —</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-[40px] h-9 px-3 flex items-center justify-center text-[10px] font-black tracking-widest uppercase transition-all border ${selectedSize === size ? "border-stone-900 bg-stone-900 text-white shadow-md" : "border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900"}`}>{size}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleCartAction}
                disabled={totalStock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isAdded
                    ? "bg-[#ccff00] text-stone-900 border border-[#b3e600] shadow-md"
                    : "bg-stone-900 text-white hover:bg-[#ccff00] hover:text-stone-900 shadow-md"
                  }`}
              >
                {totalStock <= 0 ? "OUT OF STOCK" : (
                  isAdded ? <><ShoppingBag size={14} /> VIEW BAG</> : <><Plus size={14} /> QUICK ADD</>
                )}
              </button>

              <button onClick={(e) => onWishlist(e, product)} className={`w-14 flex items-center justify-center border transition-all ${wishlisted ? "border-red-200 bg-red-50 text-red-500" : "border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900 hover:bg-stone-50"}`}>
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <button onClick={() => { navigate(`/product/${product._id}`); onClose(); }} className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors flex items-center gap-2 group">
              VIEW FULL DETAILS <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
};