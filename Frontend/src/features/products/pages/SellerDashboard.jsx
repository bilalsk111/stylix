import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useAuth } from "../../auth/hook/useAuth";
import { useSelector } from "react-redux";
import { Plus, Package, ExternalLink, Trash2, Edit3, ArrowLeft, LogOut, Store, ShieldCheck, LayoutGrid } from "lucide-react";
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
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Vault...</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* FIXED NAVIGATION - HEIGHT ADJUSTED TO PREVENT CUTOFF */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/[0.05] px-6 lg:px-10 h-20 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-neutral-500 hover:text-white transition-all group"
        >
          <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#ccff00]/50 group-hover:bg-[#ccff00]/5">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Exit Dashboard</span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]">Authorized Merchant</span>
            <span className="text-[10px] text-white/40 font-bold lowercase italic truncate max-w-[150px]">{currentUser?.email}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <button 
            onClick={() => navigate("/")}
            className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all rounded-full border border-white/5"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="p-6 lg:p-12 max-w-[1600px] mx-auto pt-32"> {/* pt-32 ensures content starts below nav */}
        
        {/* MERCHANT PROFILE - REMOVED 'SNITCH' HEADER AS REQUESTED */}
        <header className="mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white/[0.02] p-8 rounded-sm border border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#ccff00] rounded-sm flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.15)] shrink-0">
              <Store className="text-black" size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#ccff00]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ccff00]">Verified Status</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none">
                {currentUser?.fullname || "Jack Ali"}
              </h1>
              <div className="flex gap-4 pt-2">
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{displayProducts.length} Active Assets</span>
                 <span className="text-white/10">|</span>
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Premium Tier 01</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/seller/create-product")}
            className="group relative bg-[#ccff00] text-black px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all overflow-hidden shrink-0"
          >
            <div className="relative z-10 flex items-center gap-3">
              <Plus size={18} strokeWidth={4} /> Register New Piece
            </div>
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/60 opacity-40 group-hover:animate-[shine_1s_ease-in-out]" />
          </button>
        </header>

        {/* INVENTORY ARCHIVE SECTION */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <LayoutGrid size={18} className="text-[#ccff00]" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/80">Inventory Archive</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 bg-white/[0.01]">
              <Package className="text-white/5 mb-6" size={64} strokeWidth={1} />
              <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-black italic">Vault currently empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="group relative bg-white/[0.02] border border-white/5 hover:border-[#ccff00]/40 transition-all duration-500 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/seller/productdetail/${product._id}`)}
                >
                  <div className="aspect-[4/5] overflow-hidden relative bg-[#0a0a0a]">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    
                    <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1.5">
                       <span className="text-[#ccff00] text-[12px] font-black italic">
                        {product.price?.currency} {product.price?.amount}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                      <button className="p-4 bg-white text-black hover:bg-[#ccff00] transition-transform active:scale-90"><Edit3 size={20} /></button>
                      <button className="p-4 bg-black text-white hover:bg-red-600 border border-white/10 transition-transform active:scale-90"><Trash2 size={20} /></button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-[11px] font-black uppercase tracking-widest truncate text-white/90 group-hover:text-[#ccff00] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[10px] text-white/30 line-clamp-2 italic leading-relaxed font-medium">
                        {product.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-white/20">Ref: {product._id?.slice(-8)}</span>
                      <ExternalLink size={14} className="text-white/10 group-hover:text-[#ccff00]" />
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