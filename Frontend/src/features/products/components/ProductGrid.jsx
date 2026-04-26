import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LayoutGrid, Plus } from "lucide-react";

const ProductGrid = ({ products = [], title = "Recommended Drops", limit = 4 }) => {
  const navigate = useNavigate();

  const randomProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }, [products, limit]);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="w-full bg-transparent">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER SECTION - Light Theme Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-stone-200 pb-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-[#ccff00]"></span>
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500">
                Curated Selection
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <LayoutGrid size={24} className="text-stone-900" />
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-stone-900 leading-none">
                {title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1.5 group pb-1"
          >
            View Full Archive
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </button>
        </div>

        {/* GRID SECTION - Matches AllProducts UI */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
          {randomProducts.map((product) => {
            const stock = product.stock || 0;
            const isOutOfStock = stock === 0;

            return (
              <div
                key={product._id}
                className="group flex flex-col cursor-pointer"
                onClick={() => {
                  navigate(`/product/${product._id}`);
                  window.scrollTo(0, 0); // Ensures page scrolls to top when navigating
                }}
              >
                {/* IMAGE CONTAINER */}
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-xl mb-4 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500 border border-stone-200/60">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] ${isOutOfStock ? 'grayscale opacity-70' : 'mix-blend-multiply'}`}
                  />

                  {/* STOCK BADGE */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    {isOutOfStock ? (
                      <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        Sold Out
                      </span>
                    ) : (
                      <span className="bg-white/90 backdrop-blur-md text-stone-900 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* QUICK ADD OVERLAY */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                    <button className="w-full bg-white/95 backdrop-blur-xl text-stone-900 text-[9px] sm:text-[10px] font-black uppercase py-3 sm:py-3.5 tracking-[0.2em] rounded-lg shadow-lg hover:bg-[#ccff00] transition-colors flex items-center justify-center gap-2">
                      Quick Add <Plus size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>

                {/* DETAILS CONTAINER */}
                <div className="flex flex-col px-1.5">
                  <h3 
                    className="text-[11px] sm:text-[13px] font-black uppercase tracking-widest text-stone-900 truncate mb-1.5"
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] sm:text-[14px] font-bold text-stone-700">
                      {product.price?.currency} {product.price?.amount}
                    </span>
                    {product.price?.amount && (
                      <span className="text-[10px] sm:text-[11px] text-stone-400 line-through font-medium">
                        {product.price.currency} {Math.round(product.price.amount * 1.5)}
                      </span>
                    )}
                  </div>

                  {/* AUTHENTIC BADGE */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
                    <div className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8ff00] opacity-40 group-hover:opacity-100"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500"></span>
                    </div>
                    <span className="text-[8px] text-stone-400 font-black uppercase tracking-[0.2em] group-hover:text-stone-900 transition-colors">
                      Stylix Authentic
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;