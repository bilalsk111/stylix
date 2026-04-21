import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { LayoutGrid, ArrowUpRight, SlidersHorizontal, Search, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const { handleGetAllProduct } = useProduct();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const allProducts = await handleGetAllProduct();
        setProducts(allProducts || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const SkeletonCard = () => (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="aspect-[4/5] bg-neutral-900 rounded-sm" />
      <div className="space-y-3">
        <div className="h-4 bg-neutral-900 w-2/3" />
        <div className="h-4 bg-neutral-900 w-1/4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">

      <main className="max-w-[1800px] mx-auto p-6 lg:p-12 lg:pt-24 pt-32">
        
        {/* HERO SECTION */}
        <header className="mb-24 relative overflow-hidden">
          <div className="flex flex-col items-start relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <span className="h-[1px] w-12 bg-[#ccff00]"></span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ccff00]">
                  Registry / Vol. 04
                </h2>
            </div>
            
            <h1 className="text-6xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12">
              THE <br/> 
              <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>VAULT</span>
            </h1>
            
            <div className="w-full flex flex-col md:flex-row justify-between items-end gap-8">
               <p className="max-w-md text-neutral-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                 A curated index of precision-cut garments and digital-first assets. 
                 Limited availability per drop.
               </p>
               <div className="flex items-center gap-8 border-b border-white/10 pb-4 w-full md:w-auto">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <SlidersHorizontal size={14} className="group-hover:text-[#ccff00] transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <LayoutGrid size={14} className="text-[#ccff00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Grid(4)</span>
                  </div>
               </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-white/5 bg-[#080808]">
            <p className="text-neutral-600 text-[10px] uppercase tracking-[0.5em] font-bold">Inventory Zero</p>
          </div>
        ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-24">
  {products.map((product) => (
    <div
      key={product._id}
      className="group flex flex-col cursor-pointer relative"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="aspect-[4/5] overflow-hidden relative bg-[#0a0a0a] rounded-sm transition-all duration-700 ring-1 ring-white/5 group-hover:ring-[#ccff00]/30 shadow-2xl">
      
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10" />

        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
          alt={product.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.23,1,0.32,1)]"
        />

        <div className="absolute top-4 left-4 z-20 overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="bg-black/40 backdrop-blur-md text-[8px] font-black px-3 py-1 uppercase tracking-widest border border-white/10 group-hover:border-[#ccff00]/50 group-hover:text-[#ccff00] transition-all duration-500">
              In Stock
            </span>
            {/* New: Availability indicator */}
            <div className="h-[2px] w-0 group-hover:w-full bg-[#ccff00] transition-all duration-700 delay-100" />
          </div>
        </div>

        {/* Interactive Top Right Icon */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
          <div className="w-10 h-10 bg-[#ccff00] text-black flex items-center justify-center rounded-full transition-transform duration-500 hover:scale-110 hover:rotate-12 active:scale-90 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            <ArrowUpRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Bottom Hover Overlay - Slide & Blur Effect */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
          <button className="w-full bg-[#ccff00] text-black text-[10px] font-black uppercase py-4 tracking-[0.3em] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-[0.98]">
            Quick Add +
          </button>
        </div>
      </div>

      {/* Info Block - Refined Typography & Spacing */}
      <div className="mt-6 flex flex-col gap-2 px-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 max-w-[70%]">
            <h3 className="text-[15px] font-black uppercase tracking-tighter text-white/90 group-hover:text-[#ccff00] transition-colors duration-300 leading-tight">
              {product.title}
            </h3>
            {/* New: Subtle Category/Tag */}
            <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.4em]">Limited Drop</span>
          </div>
          
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[17px] font-black text-[#ccff00] leading-none group-hover:scale-105 transition-transform duration-300">
              {product.price?.currency} {product.price?.amount}
            </span>
            <span className="text-[10px] text-neutral-600 font-bold line-through mt-1 italic">
              {product.price?.currency} {(product.price?.amount * 1.2).toFixed(0)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 group-hover:border-white/20 transition-colors">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-20 group-hover:opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-800 group-hover:bg-[#ccff00] transition-colors duration-500"></span>
            </div>
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] group-hover:text-neutral-300 transition-colors">
              Stylix Authentic
            </span>
          </div>
          
          <span className="text-[8px] font-bold text-white/10 uppercase group-hover:text-white/40 transition-colors">
            Vault ID: {product._id?.slice(-5)}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-60 border-t border-white/5 py-32 px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-center">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 order-2 md:order-1 text-center md:text-left">
              ©2026 Stylix Corp. <br/> All Rights Reserved.
            </div>
            <div className="flex justify-center order-1 md:order-2">
               <h1 className="text-7xl font-black italic tracking-tighter uppercase">Stylix.</h1>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 order-3 text-center md:text-right">
              Privacy Policy <br/> Terms of Service
            </div>
          </div>
      </footer>
    </div>
  );
};

export default AllProducts;