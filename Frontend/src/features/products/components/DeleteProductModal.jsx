import { AlertTriangle, X } from "lucide-react";

export const DeleteProductModal = ({ product, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
    <div className="bg-white border border-stone-200 w-full max-w-sm rounded-none overflow-hidden shadow-2xl">

      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-900">
            Delete Product
          </span>
        </div>
        <button onClick={onCancel} className="text-stone-400 hover:text-stone-900 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-[12px] text-stone-600 leading-relaxed">
          Are you sure you want to permanently delete this product?
        </p>

        {/* Product preview */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-none p-3 mt-4">
          <div className="w-10 h-12 bg-stone-200 rounded-none overflow-hidden flex-shrink-0">
            {product?.images?.[0]?.url && (
              <img src={product.images[0].url} className="w-full h-full object-cover grayscale" alt="" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase text-stone-900 truncate">
              {product?.title}
            </p>
            <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
              {product?.price?.currency} {product?.price?.amount} · {product?.variants?.length || 0} variants
            </p>
          </div>
        </div>

        <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-4">
          ⚠ All variants and images will be erased. Cannot be undone.
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-none
                     border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-900 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-none
                     bg-red-500 text-white hover:bg-red-600 transition-all">
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);