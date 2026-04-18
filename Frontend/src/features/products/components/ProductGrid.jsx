import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LayoutGrid } from "lucide-react";

const ProductGrid = ({ products =[], title = "Recommended Drops", limit = 4 }) => {
  const navigate = useNavigate();

  const randomProducts = useMemo(() => {
      if (!Array.isArray(products)) return [];
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }, [products, limit]);

   if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="w-full px-6 lg:px-12 bg-transparent">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <LayoutGrid size={18} className="text-[#ccff00]" />
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 hover:text-[#ccff00] transition-colors flex items-center gap-2 group"
          >
            View Full Archive{" "}
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-20">
          {randomProducts.map((product) => (
            <div
              key={product._id}
              className="group flex flex-col cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="aspect-[4/5] overflow-hidden relative bg-[#0a0a0a] rounded-sm transition-all duration-700">
                <img
                  src={product.images?.[0]?.url || "https://via.placeholder.com/600x800"}
                  alt={product.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                />

                <div className="absolute top-4 left-4">
                  <span className="bg-black/80 backdrop-blur-md text-[8px] font-black px-3 py-1 uppercase tracking-widest border border-white/10 group-hover:border-[#ccff00]/50 transition-colors">
                    In Stock
                  </span>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                  <div className="w-10 h-10 bg-[#ccff00] text-black flex items-center justify-center rounded-full rotate-45 group-hover:rotate-0 transition-transform duration-700">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <button className="w-full bg-white text-black text-[10px] font-black uppercase py-3 tracking-[0.2em] hover:bg-[#ccff00] transition-colors">
                    Quick Add +
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-1">
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
                  <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em]">
                    Stylix Authentic
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;