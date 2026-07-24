import React from "react";
import { Heart } from "lucide-react";

export const WishlistToast = ({ product, isRemoving }) => (
  <div className="flex items-center gap-4 bg-white border border-stone-100 px-4 py-3 min-w-[280px] shadow-lg">
    <div className="w-10 h-12 bg-stone-100 flex-shrink-0">
      {product?.images?.[0]?.url && (
        <img src={product.images[0].url} className="w-full h-full object-cover mix-blend-multiply" alt="" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isRemoving ? 'text-stone-400' : 'text-[#8cb300]'}`}>
        {isRemoving ? 'Removed' : 'Archived'}
      </p>
      <p className="text-[11px] font-black uppercase text-stone-900 truncate">{product?.title}</p>
    </div>
  </div>
);