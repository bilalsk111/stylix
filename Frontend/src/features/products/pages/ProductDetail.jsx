import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Zap, ChevronRight, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { useProduct } from "../hook/useProduct";
import ProductGrid from "../components/ProductGrid";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById,handleGetAllProduct } = useProduct();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  // const [selectedSize, setSelectedSize] = useState("L");
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);


useEffect(() => {
  const fetchProduct = async () => {
    try {
      const data = await handleGetProductById(id);
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);
  useEffect(() => {
    const fetchAll = async () => {
      const data = await handleGetAllProduct();
      setAllProducts(data);
    };

    fetchAll();
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing...</div>
    </div>
  );

  if (!product) return <div className="text-white p-20 text-center uppercase tracking-widest text-xs">Asset Not Found</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ccff00] selection:text-black">
      {/* BREADCRUMBS - Reduced padding */}
      <nav className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-2">
        <span className="cursor-pointer hover:text-white" onClick={() => navigate("/")}>Home</span>
        <ChevronRight size={8} />
        <span className="text-neutral-400 truncate max-w-[150px]">{product.title}</span>
      </nav>

      {/* Main Container - Reduced max-width for tighter feel */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
        
        {/* LEFT: IMAGE GALLERY - Reduced col-span from 7 to 6 */}
        <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-3">
          {/* Vertical Thumbnails - Reduced size */}
          <div className="flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[500px] no-scrollbar">
            {product.images?.map((img, i) => (
              <div 
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-20 border cursor-pointer transition-all duration-300 ${activeImg === i ? 'border-[#ccff00]' : 'border-white/5 opacity-40'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Main Large Image - Tighter Aspect Ratio */}
          <div className="w-full aspect-[4/5] bg-[#0a0a0a] border border-white/5 relative overflow-hidden group">
            <img 
              src={product.images?.[activeImg]?.url} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={product.title} 
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 px-2 py-1 border border-[#ccff00]/20 backdrop-blur-sm">
               <ShieldCheck size={10} className="text-[#ccff00]" />
               <span className="text-[7px] font-black tracking-widest uppercase">Verified Asset</span>
            </div>
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO & ACTION - Col-span 6 */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            {/* Reduced Title Size from 7xl to 4xl */}
            <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter leading-tight mb-3">
              {product.title}
            </h1>
            <p className="text-neutral-400 font-medium italic text-[13px] leading-relaxed max-w-sm">
              {product.description}
            </p>
          </div>

          {/* PRICING BLOCK - Reduced text size */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-[#ccff00] italic">
              {product.price?.currency} {product.price?.amount}
            </span>
            <span className="text-neutral-600 line-through text-[11px] font-bold uppercase tracking-widest">
              {product.price?.currency} {(product.price?.amount * 1.5).toFixed(0)}
            </span>
          </div>

          {/* SIZE SELECTION - Compact buttons
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Select Dimension</span>
              <span className="text-[8px] text-[#ccff00] font-black border-b border-[#ccff00] cursor-pointer">Size Guide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["S", "M", "L", "XL", "2XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 text-[10px] font-black transition-all duration-300 border ${
                    selectedSize === size 
                    ? "bg-[#ccff00] text-black border-[#ccff00]" 
                    : "border-white/10 text-white hover:border-white/40"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div> */}

          {/* CALL TO ACTIONS - Reduced padding */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
            <button className="flex-1 bg-white text-black py-4 font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 hover:bg-[#ccff00] transition-all active:scale-95">
              <ShoppingBag size={13} /> Add to Cart
            </button>
            <button className="flex-1 bg-[#ccff00] text-black py-4 font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95">
              <Zap size={13} fill="currentColor" /> Buy It Now
            </button>
          </div>

          {/* TRUST BADGES - Tighter layout */}
          <div className="grid grid-cols-2 gap-3 pt-6">
            <div className="flex items-center gap-2 p-3 bg-[#080808] border border-white/5">
              <Truck size={16} className="text-[#ccff00]" />
              <span className="text-[7px] font-bold uppercase tracking-widest leading-tight text-neutral-400">Priority<br/><span className="text-white">Shipping</span></span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#080808] border border-white/5">
              <RefreshCcw size={16} className="text-[#ccff00]" />
              <span className="text-[7px] font-bold uppercase tracking-widest leading-tight text-neutral-400">15 Day<br/><span className="text-white">Exchange</span></span>
            </div>
          </div>
        </div>
      </div>
          <ProductGrid
        products={allProducts.filter(p => p._id !== product._id)}
        title="More From The Vault"
        limit={4}
      />
    </div>
  );
};

export default ProductDetail;