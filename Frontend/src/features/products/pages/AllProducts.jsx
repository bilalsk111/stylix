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

  // Skeleton Loader for better UX
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

      <main className="max-w-[1800px] mx-auto p-6 lg:p-12 pt-32">
        
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

        {/* PRODUCT GRID */}
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
                className="group flex flex-col"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {/* Product Frame */}
                <div className="aspect-[4/5] overflow-hidden relative bg-[#0a0a0a] rounded-sm transition-all duration-700">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                    alt={product.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/80 backdrop-blur-md text-[8px] font-black px-3 py-1 uppercase tracking-widest border border-white/10 group-hover:border-[#ccff00]/50 transition-colors">
                        In Stock
                    </span>
                  </div>

                  {/* Top Right Detail */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                    <div className="w-10 h-10 bg-[#ccff00] text-black flex items-center justify-center rounded-full rotate-45 group-hover:rotate-0 transition-transform duration-700">
                        <ArrowUpRight size={20} />
                    </div>
                  </div>

                  {/* Bottom Hover Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                     <button className="w-full bg-white text-black text-[10px] font-black uppercase py-3 tracking-[0.2em] hover:bg-[#ccff00] transition-colors">
                        Quick Add +
                     </button>
                  </div>
                </div>

                {/* Info Block - Price Enhanced */}
                <div className="mt-6 flex flex-col gap-1 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[14px] font-black uppercase tracking-tighter text-white group-hover:text-[#ccff00] transition-colors max-w-[70%]">
                        {product.title}
                    </h3>
                    <div className="flex flex-col items-end">
                        <span className="text-[16px] font-black text-white leading-none">
                            {product.price?.currency} {product.price?.amount}
                        </span>
                        <span className="text-[9px] text-neutral-600 font-bold line-through">
                             {product.price?.currency} {(product.price?.amount * 1.2).toFixed(0)}
                        </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-neutral-800 group-hover:bg-[#ccff00] transition-colors"></span>
                    <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em]">Stylix Authentic</span>
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