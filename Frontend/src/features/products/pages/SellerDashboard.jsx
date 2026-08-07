import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useAuth } from "../../auth/hook/useAuth";
import { useSelector } from "react-redux";
import {
  Plus, Package, ExternalLink, Trash2, Edit3, ArrowLeft,
  LogOut, Store, ShieldCheck, LayoutGrid, Box, Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { logoutApi } from "../../auth/services/auth.api";
import { DeleteProductModal } from "../components/DeleteProductModal";
import EditProductModal from "../components/EditProductModal";

//    Stable Empty Array reference
const EMPTY_ARRAY = [];

const DashboardSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white border border-stone-100 shadow-sm animate-pulse">
        <div className="aspect-[4/5] bg-stone-200"></div>
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          <div className="h-3 bg-stone-200 w-3/4"></div>
          <div className="h-2 bg-stone-200 w-full"></div>
          <div className="h-2 bg-stone-200 w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Main Dashboard ───────────────────────────────────────────── */
const SellerDashboard = () => {
  const navigate = useNavigate();
  const { handleGetSellerProduct, handleDeleteProduct } = useProduct();
  const { currentUser } = useAuth();
  
  // Check Redux cache directly
  const cachedProducts = useSelector((state) => state.product?.sellerProducts || EMPTY_ARRAY);
  
  const [loading, setLoading] = useState(() => cachedProducts.length === 0);
  const [editTargetId, setEditTargetId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Background Sync without UI blocking
  useEffect(() => {
    let isMounted = true;
    
    const fetch = async () => {
      try {
        if (cachedProducts.length === 0) {
          setLoading(true);
        }
        await handleGetSellerProduct(); // Silent background fetch
      } catch (error) {
        console.error("Failed to load seller products", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetch();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      toast.success("Logged out successfully.", {
        style: { background: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
      });
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.", {
        style: { background: '#1c1917', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await handleDeleteProduct(deleteTarget._id);
      await handleGetSellerProduct();
      toast.success("Asset erased from the vault.", {
        style: { background: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
      });
    } catch {
      toast.error("Failed to delete asset.", {
        style: { background: '#1c1917', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      <Toaster position="top-right" />

      {/* Navbar - Fixed at h-20 (80px) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#f7f6f4]/90 backdrop-blur-xl border-b border-stone-200 px-4 lg:px-10 h-20 flex items-center justify-between">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group">
          <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors shrink-0">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Exit Dashboard</span>
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#a3d100]">Authorized Merchant</span>
            <span className="text-[10px] text-stone-400 font-bold lowercase italic truncate max-w-[120px] sm:max-w-[150px]">{currentUser?.email}</span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-5 sm:py-3 bg-red-50 sm:rounded-none rounded-full text-red-500 hover:text-red-700 border sm:border-transparent border-red-200 transition-colors shadow-sm shrink-0"
            title="Log Out"
          >
            <LogOut size={14} className="sm:mr-2" /> 
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Wrapper - Padding adjusted to clear navbar */}
      <div className="px-4 lg:px-12 pt-28 pb-20 max-w-[1600px] mx-auto">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-6 md:p-8 rounded-none border border-stone-200 shadow-sm">
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#c8ff00] rounded-none flex items-center justify-center shadow-sm shrink-0">
              <Store className="text-stone-900" size={28} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#a3d100]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#a3d100]">Verified Status</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-stone-900 break-words">
                {currentUser?.fullname || "Authorized User"}
              </h1>
              <div className="flex flex-wrap gap-2 md:gap-4 pt-1 md:pt-2">
                <span className="text-[9px] md:text-[10px] font-black uppercase text-stone-400 tracking-widest">{cachedProducts.length} Active Assets</span>
                <span className="text-stone-300 hidden sm:block">|</span>
                <span className="text-[9px] md:text-[10px] font-black uppercase text-stone-400 tracking-widest">Premium Tier 01</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0 w-full md:w-auto mt-2 md:mt-0">
            <button onClick={() => navigate("/seller/orders")}
              className="w-full md:w-auto bg-white border-2 border-stone-900 text-stone-900 px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-stone-900 hover:text-white transition-all rounded-none shadow-sm flex items-center justify-center gap-2 md:gap-3">
              <Package size={16} strokeWidth={3} /> Manage Orders
            </button>
            <button onClick={() => navigate("/seller/create-product")}
              className="w-full md:w-auto bg-stone-900 text-white px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all rounded-none shadow-lg flex items-center justify-center gap-2 md:gap-3">
              <Plus size={16} strokeWidth={4} /> Register New Piece
            </button>
          </div>
        </header>

        {/* Inventory */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <LayoutGrid size={18} className="text-stone-900" />
            <h2 className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.5em] text-stone-900">Inventory Archive</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-300 to-transparent" />
          </div>

          {/* Safe rendering directly from cachedProducts */}
          {loading && cachedProducts.length === 0 ? (
            <DashboardSkeleton />
          ) : cachedProducts.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 bg-white rounded-none">
              <p className="text-stone-400 text-[10px] uppercase tracking-[0.5em] font-black italic">Vault currently empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {cachedProducts.map((product) => {
                
                const totalStock = product?.variants?.length > 0 
                  ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) 
                  : (Number(product?.stock) || 0);
                  
                const isOutOfStock = totalStock <= 0;

                return (
                  <div key={product._id}
                    className="group relative bg-white border border-stone-200 hover:border-stone-400 transition-all duration-500 cursor-pointer overflow-hidden rounded-none shadow-sm hover:shadow-xl"
                    onClick={() => navigate(`/seller/productdetail/${product._id}`)}>

                    <div className="aspect-[4/5] overflow-hidden relative bg-stone-100">
                      <img src={product.images?.[0]?.url} alt={product.title}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : "opacity-90 group-hover:opacity-100"}`} />

                      {/* Price Tag */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md border border-stone-200 px-2 py-1 sm:px-3 sm:py-1.5 z-10 rounded shadow-sm">
                        <span className="text-stone-900 text-[10px] sm:text-[12px] font-black italic uppercase tracking-tight">
                          {product.price?.currency} {product.price?.amount}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10">
                        <div className={`flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm border px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm ${isOutOfStock ? "bg-red-50/90 border-red-200" : "bg-white/90 border-stone-200"}`}>
                          <Box size={10} className={isOutOfStock ? "text-red-500" : "text-[#a3d100]"} />
                          <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter ${isOutOfStock ? "text-red-600" : "text-stone-700"}`}>
                            {isOutOfStock ? "SOLD OUT" : `Qty: ${totalStock}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm">
                          <Layers size={10} className="text-stone-400" />
                          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-stone-700">{product.variants?.length || 0} Var</span>
                        </div>
                      </div>

                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTargetId(product._id);
                          }}
                          className="p-2.5 sm:p-4 bg-stone-900 text-white rounded-full hover:bg-[#c8ff00] hover:text-stone-900 shadow-lg transition-all active:scale-90"
                        >
                          <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(product); }}
                          className="p-2.5 sm:p-4 bg-white text-red-500 rounded-full border border-red-200 hover:bg-red-500 hover:text-white shadow-lg transition-all active:scale-90">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate text-stone-900 group-hover:text-stone-500 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] text-stone-500 line-clamp-2 italic leading-relaxed font-medium">
                          {product.description}
                        </p>
                      </div>

                      {product.attributes && Object.keys(product.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-2 pt-0.5">
                          {Object.entries(product.attributes).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="text-[6px] sm:text-[7px] font-black uppercase border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-stone-500 tracking-wider sm:tracking-widest rounded-none truncate max-w-full">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 sm:pt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase text-stone-400 tracking-tighter">Ref: {product._id?.slice(-8)}</span>
                        <ExternalLink size={13} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <DeleteProductModal
          product={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 transition-all duration-300">
          <div
            className="bg-white border border-stone-200 rounded-none max-w-sm w-full p-6 shadow-2xl space-y-5 transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-900">
                Confirm Logout
              </h3>
              <p className="text-[10px] text-stone-500 italic leading-relaxed font-medium">
                Are you sure you want to exit your account? You will need to log back in to access your seller dashboard.
              </p>
            </div>

            <div className="border-t border-stone-100" />

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border border-stone-200 bg-white rounded-none text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-stone-900 text-white rounded-none hover:bg-red-500 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogOut size={12} />
                )}
                {isLoggingOut ? "Logging Out..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <EditProductModal
        productId={editTargetId}
        isOpen={!!editTargetId}
        onClose={() => setEditTargetId(null)}
        onSuccess={() => handleGetSellerProduct()}
      />
    </div>
  );
};

export default SellerDashboard;