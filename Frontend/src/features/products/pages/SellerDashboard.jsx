import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useAuth } from "../../auth/hook/useAuth"; // Import your auth hook
import { useSelector } from "react-redux";
import { Plus, Package, ExternalLink, Trash2, Edit3, ArrowLeft, LogOut, Store, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const { currentUser } = useAuth(); // Get seller details (name, etc.)
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

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#ccff00] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
          Accessing Secure Vault...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      
      <div className="w-full border-b border-white/5 fixed top-15 z-50 px-6 py-4 flex justify-between items-center">
        <button 
         onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Authorized Access</span>
              <span className="text-[9px] text-neutral-500 font-medium lowercase italic">{currentUser?.email}</span>
           </div>
           <button 
            onClick={() => navigate("/")}
            className="p-2 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-lg text-neutral-500"
            title="Exit Dashboard"
           >
            <LogOut size={18} />
           </button>
        </div>
      </div>

      <div className="p-6 lg:p-12 max-w-[1600px] mx-auto">
        
        {/* SELLER PROFILE SECTION */}
        <header className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#ccff00]/10 rounded-xl">
                <Store className="text-[#ccff00]" size={24} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Official Merchant</h2>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                  {currentUser?.fullname || "Vault Member"}
                </h1>
              </div>
            </div>
            
            <div className="flex gap-6 items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{displayProducts.length}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-600">Active Assets</span>
              </div>
              <div className="h-10 w-[1px] bg-white/5"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#ccff00]">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-600">Account Status</span>
              </div>
            </div>
          </div>

          <div className="flex justify-start lg:justify-end">
            <button
              onClick={() => navigate("/seller/create-product")}
              className="group relative bg-white text-black px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#ccff00] transition-all overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Plus size={16} strokeWidth={3} /> Register New Piece
              </div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/40 opacity-40 group-hover:animate-shine" />
            </button>
          </div>
        </header>

        {/* INVENTORY TITLE */}
        <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 whitespace-nowrap">Current Inventory</span>
            <div className="h-[1px] w-full bg-white/5"></div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-white/5 bg-[#080808]/50 rounded-3xl">
            <Package className="text-neutral-800 mb-6" size={48} strokeWidth={1} />
            <p className="text-neutral-600 text-[10px] uppercase tracking-[0.5em] font-bold">The vault is currently empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayProducts.map((product) => (
              <div key={product._id} className="group relative bg-[#080808] border border-white/5 hover:border-[#ccff00]/30 transition-all duration-500 rounded-sm">
                <div className="aspect-[3/4] overflow-hidden relative bg-[#111]">
                  <img
                    src={product.images?.[0]?.url || "https://via.placeholder.com/400x500"}
                    alt={product.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 border border-white/10">
                    <span className="text-[#ccff00] text-[10px] font-black uppercase">
                      {product.price?.currency} {product.price?.amount}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button className="p-4 bg-white text-black hover:bg-[#ccff00] transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-4 bg-white text-black hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-2 truncate group-hover:text-[#ccff00] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-[10px] text-neutral-500 line-clamp-2 mb-6 italic leading-relaxed">
                    {product.description}
                  </p>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    <span>ID: {product._id?.slice(-6)}</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;