import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { LayoutGrid, SlidersHorizontal, Plus, Search,X } from "lucide-react"; // 🔥 Search icon import kiya
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const { handleGetAllProduct } = useProduct();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 🔥 Search state add ki
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
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="aspect-[3/4] bg-stone-200/60 rounded-xl" />
      <div className="space-y-2.5 px-1">
        <div className="h-3 bg-stone-200/60 w-3/4 rounded" />
        <div className="h-3 bg-stone-200/60 w-1/3 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-[#ccff00] selection:text-stone-900">

      <main className="max-w-[1800px] mx-auto p-6 md:p-12 lg:p-16 lg:pt-24 pt-32">

        {/* HERO SECTION */}
        <header className="mb-12 relative">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[2px] w-10 bg-[#ccff00]"></span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">
                The Archive / Vol. 04
              </h2>
            </div>

            <h1 className="text-6xl md:text-[8rem] lg:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] mb-8 text-stone-900">
              New <br /> 
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #1c1917' }}>Arrivals</span>
            </h1>

            <p className="max-w-xl text-stone-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-12">
              A curated index of precision-cut garments. Limited availability per drop. Secure your assets.
            </p>
          </div>
        </header>
        {/* 🔥 NEW COMPONENT: THE MINIMALIST TOOLBAR (Underline Search) */}
        <div className="bg-[#f7f6f4]/90 backdrop-blur-xl py-6 mb-12 transition-all">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 w-full">
            
            {/* 1. Ultra-Sleek Search Bar (Only Bottom Border) */}
            <div className="relative flex-1 w-full max-w-2xl flex items-center group border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors duration-300 pb-2">
              <Search 
                size={18} 
                className="text-stone-400 group-focus-within:text-stone-900 transition-colors duration-300 mr-3" 
              />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COLLECTION..." 
                className="w-full bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-[0.2em] text-stone-900 placeholder-stone-400 focus:placeholder-stone-300"
              />
              {/* Clear button */}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-stone-400 hover:text-stone-900 transition-colors ml-2"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* 2. Controls (Filters & Grid) */}
            <div className="flex items-center gap-8 shrink-0 pb-2 w-full md:w-auto justify-between md:justify-end">
              <button className="flex items-center gap-2.5 group">
                <SlidersHorizontal size={15} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors">Filters</span>
              </button>
              <div className="flex items-center gap-2.5 cursor-pointer">
                <LayoutGrid size={15} className="text-stone-900" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">View Grid</span>
              </div>
            </div>

          </div>
        </div>

        {/* GRID SECTION */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-16">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-3xl">
            <p className="text-stone-400 text-[11px] uppercase tracking-[0.5em] font-bold">Inventory Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-16">
            {products
              .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())) // 🔥 Search logic apply kar di
              .map((product) => {
              const stock = product.stock || 0;
              const isOutOfStock = stock === 0;

              return (
                <div
                  key={product._id}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-xl mb-5 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500 border border-stone-200/60">
                    <img
                      src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] ${isOutOfStock ? 'grayscale opacity-70' : 'mix-blend-multiply'}`}
                    />
                    
                    <div className="absolute top-4 left-4">
                      {isOutOfStock ? (
                        <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm">
                          Sold Out
                        </span>
                      ) : (
                        <span className="bg-white/90 backdrop-blur-md text-stone-900 text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-sm border border-white/20">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                      <button className="w-full bg-white/95 backdrop-blur-xl text-stone-900 text-[10px] font-black uppercase py-4 tracking-[0.2em] rounded-lg shadow-lg hover:bg-[#ccff00] transition-colors flex items-center justify-center gap-2">
                        Quick Add <Plus size={14} strokeWidth={2.5}/>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col px-1.5">
                    <h3 
                      className="text-[13px] font-black uppercase tracking-widest text-stone-900 truncate mb-2" 
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-medium text-stone-600">
                        {product.price?.currency} {product.price?.amount}
                      </span>
                      {product.price?.amount && (
                        <span className="text-[11px] text-stone-400 line-through font-medium">
                          {product.price.currency} {Math.round(product.price.amount * 1.5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-40 border-t border-stone-200 py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 order-2 md:order-1 text-center md:text-left">
            ©2026 Stylix Corp. <br /> Built for the modern era.
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-stone-900">Stylix.</h1>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 order-3 text-center md:text-right">
            Privacy Policy <br /> Terms of Service
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllProducts;