import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { LayoutGrid, ArrowUpRight, SlidersHorizontal } from "lucide-react";
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
      <div className="aspect-[4/5] bg-stone-200 rounded-sm" />
      <div className="space-y-3">
        <div className="h-4 bg-stone-200 w-2/3 rounded" />
        <div className="h-4 bg-stone-200 w-1/4 rounded" />
      </div>
    </div>
  );

  return (
    // EXACT REGISTER PAGE BACKGROUND & TEXT COLORS
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">

      <main className="max-w-[1800px] mx-auto p-6 lg:p-12 lg:pt-24 pt-32">

        {/* HERO SECTION */}
        <header className="mb-24 relative overflow-hidden">
          <div className="flex flex-col items-start relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-12 bg-stone-900"></span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
                Registry / Vol. 04
              </h2>
            </div>

            <h1 className="text-6xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12 text-stone-900">
              THE <br />
              {/* REVERSED STROKE FOR LIGHT THEME */}
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #1c1917' }}>VAULT</span>
            </h1>

            <div className="w-full flex flex-col md:flex-row justify-between items-end gap-8">
              <p className="max-w-md text-stone-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                A curated index of precision-cut garments and digital-first assets.
                Limited availability per drop.
              </p>
              <div className="flex items-center gap-8 border-b border-stone-300 pb-4 w-full md:w-auto">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <SlidersHorizontal size={14} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors">Filter</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <LayoutGrid size={14} className="text-stone-900" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Grid(4)</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          // RESPONSIVE SKELETON GRID (Light Theme)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-6 lg:gap-x-8 gap-y-12 sm:gap-y-16 lg:gap-y-24">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-stone-200 bg-white shadow-sm rounded-md">
            <p className="text-stone-400 text-[10px] uppercase tracking-[0.5em] font-bold">Inventory Zero</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-3 sm:gap-x-6 lg:gap-x-8 gap-y-12 sm:gap-y-16 lg:gap-y-24">
            {/* RESPONSIVE GRID: Mobile(2), Tablet(3-4), Desktop(5-6) */}
            {products.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col cursor-pointer relative"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {/* CARD IMAGE CONTAINER */}
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-100 rounded-md transition-all duration-700 ring-1 ring-stone-200 group-hover:ring-stone-300 shadow-sm group-hover:shadow-xl">
                
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900/10 z-10" />

                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                    alt={product.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-[cubic-bezier(0.23,1,0.32,1)]"
                  />

                  {/* TOP LEFT BADGE */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 overflow-hidden">
                    <div className="flex flex-col gap-1">
                      <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[7px] sm:text-[8px] font-black px-2 py-1 sm:px-3 uppercase tracking-widest border border-stone-200 group-hover:border-[#c8ff00] transition-all duration-500 shadow-sm rounded-sm">
                        In Stock
                      </span>
                      <div className="h-[2px] w-0 group-hover:w-full bg-[#c8ff00] transition-all duration-700 delay-100" />
                    </div>
                  </div>

                  {/* TOP RIGHT ICON */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-10px] group-hover:translate-y-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-900 text-white flex items-center justify-center rounded-full transition-transform duration-500 hover:scale-110 hover:rotate-12 active:scale-90 hover:bg-[#c8ff00] hover:text-stone-900 shadow-lg">
                      <ArrowUpRight size={16} strokeWidth={3} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* BOTTOM HOVER ACTION (LIGHT THEME FADE) */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 bg-gradient-to-t from-white via-white/90 to-transparent translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <button className="w-full bg-stone-900 text-white text-[8px] sm:text-[10px] font-black uppercase py-3 sm:py-4 tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 hover:shadow-lg transition-all duration-300 active:scale-[0.98] rounded-md">
                      Quick Add +
                    </button>
                  </div>
                </div>

                {/* INFO BLOCK */}
                <div className="mt-4 sm:mt-6 flex flex-col gap-2 px-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                    <div className="flex flex-col gap-1 w-full sm:max-w-[70%]">
                      <h3 className="text-[12px] sm:text-[15px] font-black uppercase tracking-tighter text-stone-900 group-hover:text-stone-600 transition-colors duration-300 leading-tight line-clamp-2 sm:line-clamp-none">
                        {product.title}
                      </h3>
                      <span className="text-[7px] sm:text-[8px] text-stone-400 font-black uppercase tracking-[0.4em]">Limited Drop</span>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end shrink-0 gap-2 sm:gap-0 mt-1 sm:mt-0">
                      <span className="text-[14px] sm:text-[17px] font-black text-stone-900 leading-none group-hover:scale-105 transition-transform duration-300">
                        {product.price?.currency} {product.price?.amount}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold line-through mt-0 sm:mt-1 italic">
                        {product.price?.currency} {(product.price?.amount * 1.2).toFixed(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-stone-200 group-hover:border-stone-300 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-40 group-hover:opacity-100"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500"></span>
                      </div>
                      <span className="text-[8px] sm:text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] group-hover:text-stone-900 transition-colors">
                        Stylix Authentic
                      </span>
                    </div>
                    
                    <span className="text-[7px] sm:text-[8px] font-bold text-stone-300 uppercase group-hover:text-stone-400 transition-colors">
                      ID: {product._id?.slice(-5)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-60 border-t border-stone-200 py-32 px-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-center">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 order-2 md:order-1 text-center md:text-left">
            ©2026 Stylix Corp. <br /> All Rights Reserved.
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <h1 className="text-7xl font-black italic tracking-tighter uppercase text-stone-900">Stylix.</h1>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 order-3 text-center md:text-right">
            Privacy Policy <br /> Terms of Service
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllProducts;