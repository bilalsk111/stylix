import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useAuth } from "../../auth/hook/useAuth";
import { useSelector } from "react-redux";
import { Plus, Package, ExternalLink, Trash2, Edit3, ArrowLeft, LogOut, Store, ShieldCheck, LayoutGrid, Box, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const { currentUser } = useAuth();
  const sellerProduct = useSelector((state) => state.product.sellerProducts);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const displayProducts = sellerProduct || [];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await handleGetSellerProduct();
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#f7f6f4] flex items-center justify-center">
      <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Vault...</div>
    </div>
  );

  return (
    // LIGHT THEME BASE
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      
      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#f7f6f4]/80 backdrop-blur-xl border-b border-stone-200 px-6 lg:px-10 h-20 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group"
        >
          <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Exit Dashboard</span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#a3d100]">Authorized Merchant</span>
            <span className="text-[10px] text-stone-400 font-bold lowercase italic truncate max-w-[150px]">{currentUser?.email}</span>
          </div>
          <div className="h-8 w-[1px] bg-stone-200"></div>
          <button 
            onClick={() => navigate("/")}
            className="p-2.5 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all rounded-full border border-stone-200 shadow-sm"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="p-6 lg:p-12 max-w-[1600px] mx-auto pt-32"> 
        
        {/* MERCHANT PROFILE & ACTIONS */}
        <header className="mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#c8ff00] rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Store className="text-stone-900" size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#a3d100]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a3d100]">Verified Status</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-stone-900">
                {currentUser?.fullname || "Authorized User"}
              </h1>
              <div className="flex gap-4 pt-2">
                 <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{displayProducts.length} Active Assets</span>
                 <span className="text-stone-300">|</span>
                 <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Premium Tier 01</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button
              onClick={() => navigate("/seller/orders")} // 🛑 Check kar lena tumhara route path yahi hai na
              className="group relative bg-white border-2 border-stone-900 text-stone-900 px-8 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-stone-900 hover:text-white transition-all overflow-hidden rounded-md shadow-sm"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Package size={18} strokeWidth={3} /> Manage Orders
              </div>
            </button>

            <button
              onClick={() => navigate("/seller/create-product")}
              className="group relative bg-stone-900 text-white px-8 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all overflow-hidden rounded-md shadow-lg"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Plus size={18} strokeWidth={4} /> Register New Piece
              </div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-[shine_1s_ease-in-out]" />
            </button>
          </div>
        </header>

        {/* INVENTORY ARCHIVE SECTION */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <LayoutGrid size={18} className="text-stone-900" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-stone-900">Inventory Archive</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-stone-300 to-transparent"></div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 bg-white rounded-xl">
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.5em] font-black italic">Vault currently empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="group relative bg-white border border-stone-200 hover:border-stone-400 transition-all duration-500 cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-xl"
                  onClick={() => navigate(`/seller/productdetail/${product._id}`)}
                >
                  <div className="aspect-[4/5] overflow-hidden relative bg-stone-100">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-stone-200 px-3 py-1.5 z-10 rounded shadow-sm">
                       <span className="text-stone-900 text-[12px] font-black italic uppercase">
                        {product.price?.currency} {product.price?.amount}
                      </span>
                    </div>

                    {/* Stock & Variant Badges */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 px-2 py-1 rounded shadow-sm">
                        <Box size={10} className={product.stock > 0 ? "text-[#a3d100]" : "text-red-500"} />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-stone-700">
                          Qty: {product.stock || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 px-2 py-1 rounded shadow-sm">
                        <Layers size={10} className="text-stone-400" />
                        <span className="text-[8px] font-black uppercase tracking-tighter text-stone-700">
                          {product.varinate?.length || 0} Variants
                        </span>
                      </div>
                    </div>

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                      <button className="p-4 bg-stone-900 text-white rounded-full hover:bg-[#c8ff00] hover:text-stone-900 shadow-lg transition-all active:scale-90"><Edit3 size={20} /></button>
                      <button className="p-4 bg-white text-red-500 rounded-full border border-red-200 hover:bg-red-500 hover:text-white shadow-lg transition-all active:scale-90"><Trash2 size={20} /></button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-[11px] font-black uppercase tracking-widest truncate text-stone-900 group-hover:text-stone-500 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[10px] text-stone-500 line-clamp-2 italic leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Tags / Attributes Preview */}
                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(product.attributes).slice(0, 2).map(([key, value]) => (
                          <span key={key} className="text-[7px] font-black uppercase border border-stone-200 bg-stone-50 px-2 py-0.5 text-stone-500 tracking-widest rounded-sm">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-stone-400 tracking-tighter">Ref: {product._id?.slice(-8)}</span>
                      <ExternalLink size={14} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 125%; }
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;