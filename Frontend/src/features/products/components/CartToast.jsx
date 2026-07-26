import React from "react";
import { ArrowRight } from "lucide-react";

export const CartToast = ({ product, onGoToCart }) => (
  <div className="flex items-center gap-4 bg-white border border-stone-200 px-4 py-3 min-w-[280px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] pointer-events-auto">
    <div className="w-10 h-12 bg-stone-100 flex-shrink-0">
      {product?.images?.[0]?.url && (
        <img src={product.images[0].url} className="w-full h-full object-cover mix-blend-multiply" alt="" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8cb300]">Added to Bag</p>
      <p className="text-[11px] font-black uppercase text-stone-900 truncate">{product?.title}</p>
    </div>
    <button
      onClick={onGoToCart}
      className="text-[9px] font-black uppercase bg-stone-900 text-white px-3 py-2 flex items-center gap-1 hover:bg-[#ccff00] hover:text-stone-900 transition-colors"
    >
      View Bag <ArrowRight size={10} strokeWidth={2.5} />
    </button>
  </div>
);