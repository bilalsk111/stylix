import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Edit3, X, Package,
  Upload, ArrowLeft, ShieldCheck, Info
} from "lucide-react";
import { useProduct } from "../hook/useProduct";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const DEFAULT_VARIANT_FORM = {
  attributes: { Size: "", Color: "" },
  stock: "",
  price: { amount: "", currency: "INR" },
  images: [],
};

const normaliseVariant = (v) => ({
  ...v,
  attributes: {
    Size: v.attributes?.Size ?? "",
    Color: v.attributes?.Color ?? "",
  },
});

// ─────────────────────────────────────────────
// Optimized Sub-components (Memoized)
// ─────────────────────────────────────────────
const Navbar = memo(({ productId }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
          <ArrowLeft size={18} />
        </button>
        <div className="h-4 w-[1px] bg-white/10" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Master Panel / <span className="text-white/80">{productId}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
        <span className="text-[9px] font-black uppercase text-[#ccff00]">Live Sync</span>
      </div>
    </nav>
  );
});

const ProductGallery = ({ images, activeImg, setActiveImg }) => (
  <div className="lg:col-span-5 flex gap-4">
    <div className="flex flex-col gap-3 shrink-0">
      {images?.map((img, i) => (
        <button
          key={i}
          onClick={() => setActiveImg(i)}
          className={`w-14 h-18 border transition-all duration-500 ${
            activeImg === i ? "border-[#ccff00] scale-105" : "border-white/5 opacity-30 hover:opacity-100"
          }`}
        >
          <img src={img.url} className="w-full h-full object-cover" alt="" />
        </button>
      ))}
    </div>
    <div className="flex-1 aspect-[3/4] bg-white/[0.02] border border-white/5 overflow-hidden relative group">
      <img src={images?.[activeImg]?.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
      <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 border border-[#ccff00]/30 backdrop-blur-md">
        <span className="text-[8px] font-black uppercase text-[#ccff00]">Base Asset</span>
      </div>
    </div>
  </div>
);

const VariantRow = memo(({ variant, index, onEdit }) => {
  const { attributes, stock, price, images } = variant;
  return (
    <div className="group bg-white/[0.02] border border-white/5 p-5 hover:border-[#ccff00]/40 hover:bg-white/[0.04] transition-all duration-300 flex items-center gap-8">
      <div className="w-14 h-18 bg-neutral-900 border border-white/10 overflow-hidden shrink-0 group-hover:border-[#ccff00]/30">
        {images?.[0] && <img src={images[0].url} className="w-full h-full object-cover" alt="" />}
      </div>
      <div className="flex-1 grid grid-cols-3 gap-6">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-white/20 mb-1 tracking-widest">Attributes</span>
          <span className="text-xs font-black uppercase italic">{attributes.Size || "—"} / {attributes.Color || "—"}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-white/20 mb-1 tracking-widest">Availability</span>
          <span className={`text-xs font-black uppercase ${stock < 10 ? "text-red-500" : "text-white/80"}`}>{stock} Units</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-white/20 mb-1 tracking-widest">Valuation</span>
          <span className="text-xs font-black text-[#ccff00] uppercase italic">{price.currency} {price.amount}</span>
        </div>
      </div>
      <button onClick={() => onEdit(index)} className="p-4 bg-white/5 group-hover:bg-[#ccff00] group-hover:text-black transition-all duration-300 active:scale-90">
        <Edit3 size={16} />
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────
// Main Seller Page
// ─────────────────────────────────────────────
const SellerProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleAddProductVariant } = useProduct();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [variantForm, setVariantForm] = useState(DEFAULT_VARIANT_FORM);

  const fetchProduct = useCallback(async () => {
    try {
      const data = await handleGetProductById(id);
      setProduct({
        ...data,
        varinate: (data.varinate || []).map(normaliseVariant),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, handleGetProductById]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const toggleModal = (index = null) => {
    setEditingIndex(index);
    setVariantForm(index !== null ? product.varinate[index] : DEFAULT_VARIANT_FORM);
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveVariant = async () => {
    const { Size, Color } = variantForm.attributes;
    if (!Size && !Color) return alert("Attributes Required");

    try {
      const response = await handleAddProductVariant(id, variantForm);
      setProduct(prev => ({
        ...prev,
        varinate: (response.product?.varinate || []).map(normaliseVariant)
      }));
      setIsModalOpen(false);
      // Optional: Refresh or Navigate if needed
    } catch (err) {
      alert("Sync Failed");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-[#ccff00]/20 border-t-[#ccff00] rounded-full animate-spin" />
      <span className="text-[#ccff00] text-[9px] font-black tracking-[0.4em] uppercase">Syncing Nexus...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#ccff00] selection:text-black">
      <Navbar productId={product?._id} />

      <div className="max-w-[1400px] mx-auto p-6 lg:p-12 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <ProductGallery images={product?.images} activeImg={activeImg} setActiveImg={setActiveImg} />
          
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#ccff00] opacity-80">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Verified Seller Asset</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {product?.title}
              </h1>
              <p className="text-white/40 text-lg font-medium italic leading-relaxed max-w-xl">
                {product?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
              <div>
                <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-2">Base Valuation</span>
                <span className="text-4xl font-black italic text-[#ccff00]">{product?.price?.currency} {product?.price?.amount}</span>
              </div>
              <div className="border-l border-white/10 pl-8">
                <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-2">Registry Date</span>
                <span className="text-sm font-bold text-white/60 tracking-tighter">{new Date(product?.createdAt).toDateString()}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <header className="flex justify-between items-end border-b border-white/5 pb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#ccff00]">Inventory Node</h2>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">Configure variants and stock distribution</p>
            </div>
            <button onClick={() => toggleModal()} className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] transition-all active:scale-95 shadow-xl">
              Add New Variant
            </button>
          </header>

          <div className="grid grid-cols-1 gap-4">
            {product?.varinate?.length > 0 ? (
              product.varinate.map((v, idx) => <VariantRow key={idx} variant={v} index={idx} onEdit={toggleModal} />)
            ) : (
              <div className="py-32 border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-white/10 uppercase font-black tracking-[0.5em] text-[10px]">
                <Package size={40} className="mb-6 opacity-5" />
                No Active Variants Found
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl shadow-2xl scale-in-center transition-transform">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ccff00] italic">
                {editingIndex !== null ? "Modify Variant" : "Deploy New Variant"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {["Size", "Color"].map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">{key}</label>
                    <input
                      type="text"
                      value={variantForm.attributes[key]}
                      onChange={(e) => setVariantForm(prev => ({...prev, attributes: {...prev.attributes, [key]: e.target.value}}))}
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold uppercase outline-none focus:border-[#ccff00] transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">Units</label>
                  <input
                    type="number"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm(prev => ({...prev, stock: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">Market Price</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={variantForm.price.amount}
                      onChange={(e) => setVariantForm(prev => ({...prev, price: {...prev.price, amount: e.target.value}}))}
                      className="flex-1 bg-white/5 border border-white/10 p-4 text-xs font-bold outline-none focus:border-[#ccff00]"
                    />
                    <select
                      value={variantForm.price.currency}
                      onChange={(e) => setVariantForm(prev => ({...prev, price: {...prev.price, currency: e.target.value}}))}
                      className="bg-[#111] border border-white/10 px-4 text-[10px] font-black text-[#ccff00]"
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">Media Assets ({variantForm.images.length}/7)</label>
                <div className="flex flex-wrap gap-3">
                  {variantForm.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-20 border border-white/10 group overflow-hidden">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => setVariantForm(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                        className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {variantForm.images.length < 7 && (
                    <label className="w-16 h-20 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#ccff00]/50 transition-all">
                      <Upload size={14} className="text-white/20" />
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
                         const files = Array.from(e.target.files).map(file => ({ file, url: URL.createObjectURL(file) }));
                         setVariantForm(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 7) }));
                      }} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5">
              <button
                onClick={handleSaveVariant}
                className="w-full bg-[#ccff00] text-black py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all active:scale-[0.98] shadow-2xl"
              >
                {editingIndex !== null ? "Commit Changes" : "Deploy Variant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDetails;