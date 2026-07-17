import React, { useState, useEffect, memo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, X, ArrowLeft, Edit3, ShieldCheck, ShoppingBag,
  Cpu, MoveRight, Layers, ImagePlus, Trash2, AlertTriangle,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Tag, Box, AlignLeft, Barcode
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import toast, { Toaster } from "react-hot-toast";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const DEFAULT_VARIANT_FORM = {
  title: "",
  attributes: { SIZE: "", COLOR: "" },
  stock: "",
  price: { amount: "", currency: "INR" },
  images: [],
};

const globalStyles = `
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .glass-input { background: #fbfaf9; border: 1px solid #e7e5e4; transition: all 0.3s ease; color: #1c1917; }
  .glass-input:focus { border-color: #1c1917; background: #ffffff; outline: none; }
  .editorial-title { line-height: 1.1; letter-spacing: -0.03em; }
`;

/* ─────────────────────────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────────────────────────── */
const DeleteConfirmModal = ({ variant, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-900/50 backdrop-blur-sm">
    <div className="bg-white border border-stone-200 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">

      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-900">
            Remove Variant
          </span>
        </div>
        <button onClick={onCancel} className="text-stone-400 hover:text-stone-900 transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-[12px] text-stone-600 leading-relaxed">
          Are you sure you want to remove this variant? 
        </p>

        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3 mt-4">
          <div className="w-10 h-12 bg-stone-200 rounded-md overflow-hidden flex-shrink-0">
            {variant?.images?.[0] && (
              <img src={variant.images[0].url} className="w-full h-full object-cover grayscale" alt="" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase text-stone-900 truncate">
              {variant?.title || "Standard SKU"}
            </p>
            <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
              {variant?.price?.currency} {variant?.price?.amount} · {variant?.stock} units
            </p>
          </div>
        </div>

        <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-4">
          ⚠ This action cannot be undone.
        </p>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl
                     border border-stone-200 text-stone-500
                     hover:border-stone-400 hover:text-stone-900 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl
                     bg-red-500 text-white hover:bg-red-600 transition-all"
        >
          Yes, Remove
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────── */
const Navbar = memo(({ productId }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-8 py-5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 border border-stone-200 rounded-full hover:border-stone-900 transition-all text-stone-900">
          <ArrowLeft size={14} />
        </button>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400">Registry Control</span>
          <span className="text-[10px] font-mono text-stone-900 font-bold">NODE_{productId?.slice(-6).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-8">
        {['Overview', 'Analytics', 'Logistics'].map(item => (
          <span key={item} className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 cursor-pointer transition-colors hidden md:block">{item}</span>
        ))}
      </div>
    </nav>
  );
});

/* ─────────────────────────────────────────────────────────────────
   VARIANT CARD
───────────────────────────────────────────────────────────────── */
const VariantCard = memo(({ variant, index, onEdit, onDelete }) => (
  <div className="group bg-white border border-stone-200 p-4 rounded-xl hover:border-stone-300 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-3">
        <div className="w-12 h-14 bg-stone-100 rounded-md overflow-hidden border border-stone-200">
          {variant.images?.[0] && <img src={variant.images[0].url} className="w-full h-full object-cover grayscale" alt="" />}
        </div>
        <div>
          <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">NODE_0{index + 1}</span>
          {/* Variant title truncation is usually kept so it doesn't break the small card layout */}
          <h4 className="text-xs font-bold uppercase text-stone-900 truncate max-w-[150px]">{variant.title || "Standard SKU"}</h4>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(index)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
          <Edit3 size={12} />
        </button>
        <button onClick={() => onDelete(index, variant)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
    <div className="flex justify-between items-end border-t border-stone-100 pt-3">
      <div>
        <span className="text-[7px] font-black text-stone-400 uppercase block">Stock</span>
        <span className="text-[10px] font-mono text-stone-900 font-bold">{variant.stock} Units</span>
      </div>
      <div className="text-right">
        <span className="text-[7px] font-black text-stone-400 uppercase block">Price</span>
        <span className="text-[10px] font-mono text-stone-900 font-bold">{variant.price?.currency} {variant.price?.amount}</span>
      </div>
    </div>
  </div>
));


const SellerProductDetails = () => {
  const { id } = useParams();
  const { handleGetProductById, handleAddProductVariant, handleEditVariant, handleDeleteVariant } = useProduct();

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeImg,    setActiveImg]    = useState(0);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [variantForm,  setVariantForm]  = useState(DEFAULT_VARIANT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  const thumbnailRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    handleGetProductById(id).then(data => {
      if (mounted) { setProduct(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [id, handleGetProductById]);

  const onRemoveVariant = (index, variant) => setDeleteTarget({ index, variant });

  const confirmDelete = async () => {
    try {
      const { index } = deleteTarget;
      await handleDeleteVariant(id, product.variants[index]._id);
      setProduct(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
      toast.success("Variant node terminated.", { style: { background: '#1c1917', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' } });
    } catch {
      toast.error("Failed to terminate node.", { style: { background: '#1c1917', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' } });
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleModal = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const v = product.variants[index];
      setVariantForm({
        title: v.title || "",
        attributes: v.attributes || { SIZE: "", COLOR: "" },
        stock: v.stock || "",
        price: { amount: v.price?.amount || "", currency: v.price?.currency || "INR" },
        images: v.images || []
      });
    } else {
      setVariantForm(DEFAULT_VARIANT_FORM);
    }
    setIsModalOpen(o => !o);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const current = variantForm.images || [];
    if (current.length + files.length > 7)
      toast.error("Max 7 imagery assets allowed.", { style: { background: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' } });
    const toAdd = files.slice(0, 7 - current.length).map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setVariantForm(p => ({ ...p, images: [...current, ...toAdd] }));
  };

  const removeImage = (i) => setVariantForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const handleSaveVariant = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: variantForm.title,
        stock: Number(variantForm.stock),
        price: { amount: Number(variantForm.price.amount), currency: variantForm.price.currency },
        attributes: variantForm.attributes,
        images: variantForm.images
      };
      const response = editingIndex !== null
        ? await handleEditVariant(id, product.variants[editingIndex]._id, payload)
        : await handleAddProductVariant(id, payload);
      setProduct(response?.product || response?.data || response);
      setVariantForm(DEFAULT_VARIANT_FORM);
      setIsModalOpen(false);
      setEditingIndex(null);
      toast.success(editingIndex !== null ? "Node Protocol Updated." : "Node Cluster Deployed.", {
        style: { background: '#1c1917', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
      });
    } catch (err) {
      console.error(err);
      toast.error("Process failed.", { style: { background: '#1c1917', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' } });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gallery Navigation Handlers
  const handleScrollThumbnails = (direction) => {
    if (thumbnailRef.current) {
      const scrollAmount = 150;
      thumbnailRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNextImg = () => {
    if (!product?.images?.length) return;
    setActiveImg((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImg = () => {
    if (!product?.images?.length) return;
    setActiveImg((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const totalStock = product?.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || product?.stock || 0;


  if (loading) return (
    <div className="h-screen bg-[#f7f6f4] flex items-center justify-center text-stone-900 font-black text-[10px] tracking-[1em] animate-pulse">
      LOADING_NEXUS
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      <style>{globalStyles}</style>
      <Toaster position="top-right" />
      <Navbar productId={product?._id} />

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* GALLERY */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-fit lg:sticky lg:top-32">
            
            {/* Thumbnails Sidebar */}
            <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-20">
              <button 
                onClick={() => handleScrollThumbnails('up')} 
                className="hidden md:flex items-center justify-center bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-stone-200 text-stone-900 hover:bg-stone-50 transition-all z-10"
              >
                <ChevronUp size={16} strokeWidth={2.5}/>
              </button>

              <div 
                ref={thumbnailRef} 
                className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] no-scrollbar w-full md:w-full py-1 scroll-smooth"
              >
                {product?.images?.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-20 md:w-full md:aspect-[3/4] md:h-auto shrink-0 cursor-pointer overflow-hidden transition-all duration-300 rounded-xl bg-white border shadow-sm ${
                      activeImg === i
                        ? "border-stone-900 ring-1 ring-stone-900"
                        : "border-stone-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover object-top"
                      alt={`Thumbnail ${i + 1}`}
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleScrollThumbnails('down')} 
                className="hidden md:flex items-center justify-center bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-stone-200 text-stone-900 hover:bg-stone-50 transition-all z-10"
              >
                <ChevronDown size={16} strokeWidth={2.5}/>
              </button>
            </div>

            {/* Main Image */}
            <div className="w-full aspect-[3/4] md:aspect-[4/5] bg-stone-100 rounded-3xl relative overflow-hidden flex-1 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-200/50">
              <img
                src={product?.images?.[activeImg]?.url}
                className="w-full h-full object-cover object-top transition-transform duration-[0.5s] ease-out"
                alt="Product View"
              />

              {/* Navigation Arrows */}
              {product?.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImg(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-md border border-stone-200 text-stone-900 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105"
                  >
                    <ChevronLeft size={18} strokeWidth={3} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImg(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-md border border-stone-200 text-stone-900 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105"
                  >
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
                </>
              )}

              <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:block">
                <span className="bg-white/95 backdrop-blur-md text-stone-900 px-4 py-2 text-[8px] font-black uppercase tracking-widest border border-stone-200 shadow-sm rounded-md">
                  MASTER_VIEW_0{activeImg + 1}
                </span>
              </div>
            </div>
          </div>

          {/* INFO & DETAILS */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col pt-2">
            <header className="mb-10">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="text-stone-600 text-[8px] font-black uppercase tracking-[0.3em] bg-stone-200/50 px-3 py-1.5 border border-stone-200 rounded-md flex items-center gap-2 w-fit shadow-sm">
                  <ShieldCheck size={10} /> ASSET_ENCRYPTED
                </span>
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 border rounded-md flex items-center gap-2 w-fit shadow-sm ${totalStock > 0 ? "bg-[#ccff00]/20 border-[#a3cc00]/30 text-[#8cb300]" : "bg-red-50 border-red-200 text-red-500"}`}>
                  <Box size={10} /> {totalStock > 0 ? "IN_STOCK" : "DEPLETED"}
                </span>
              </div>
              
              {/* FULL TITLE: break-words ensures long continuous words wrap, removed line-clamp */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase editorial-title mb-6 text-stone-900 break-words">
                {product?.title || "Unnamed Asset"}
              </h1>

              {/* NEW DESCRIPTION BLOCK */}
              <div className="mb-8">
                <p className="text-stone-500 font-medium text-xs sm:text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {product?.description || "This asset currently lacks a detailed description protocol. Update the registry to inject narrative data."}
                </p>
              </div>
              
              {/* EXPANDED DETAILS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {[
                  { label: "Category", val: product?.category || "Apparel", icon: <Tag size={12} /> },
                  { label: "Brand", val: product?.brand || "Stylix", icon: <ShieldCheck size={12} /> },
                  { label: "Total Stock", val: `${totalStock} Units`, icon: <Box size={12} /> },
                  { label: "Base Price", val: `${product?.price?.currency || "INR"} ${product?.price?.amount || "0"}`, icon: <Barcode size={12} /> }
                ].map(spec => (
                  <div key={spec.label} className="border border-stone-200 bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest block mb-1">{spec.label}</span>
                    <span className="text-[11px] font-bold uppercase text-stone-900 truncate block">{spec.val}</span>
                  </div>
                ))}
              </div>
            </header>

            {/* VARIANTS SECTION */}
            <section className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-stone-900">
                  <ShoppingBag size={14} /> Node Clusters
                </h2>
                <button onClick={() => toggleModal()}
                  className="bg-stone-900 text-white px-5 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md active:scale-95 w-full sm:w-auto">
                  + Add Node
                </button>
              </div>
              
              <div className="grid gap-4">
                {product?.variants?.length > 0 ? (
                  product.variants.map((v, idx) => (
                    <VariantCard key={idx} variant={v} index={idx} onEdit={toggleModal} onDelete={onRemoveVariant} />
                  ))
                ) : (
                   <div className="py-10 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                     <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">No Variants Defined</p>
                   </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── Variant Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center shrink-0 bg-stone-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
                {editingIndex !== null ? "Modify Node Protocol" : "Deploy Node Cluster"}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingIndex(null); }} className="text-stone-400 hover:text-stone-900 transition-colors bg-white border border-stone-200 p-1.5 rounded-full shadow-sm">
                <X size={14} strokeWidth={2.5}/>
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between px-1">
                  <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest">Variant Imagery</label>
                  <span className="text-[9px] font-black text-stone-900">{variantForm.images?.length || 0} / 7</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 px-1">
                  {variantForm.images?.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-20 shrink-0 border border-stone-200 rounded-xl overflow-hidden group shadow-sm">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-white/95 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-stone-200 shadow-sm hover:bg-red-50 hover:text-red-500">
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  {(variantForm.images?.length || 0) < 7 && (
                    <label className="w-16 h-20 shrink-0 border border-dashed border-stone-300 rounded-xl flex flex-col gap-1.5 items-center justify-center cursor-pointer group hover:border-stone-900 hover:bg-stone-50 transition-colors">
                      <ImagePlus size={16} strokeWidth={2} className="text-stone-400 group-hover:text-stone-900" />
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-900">Add</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest px-1">Title</label>
                <input type="text" value={variantForm.title} onChange={e => setVariantForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full glass-input p-4 rounded-xl text-[11px] font-bold uppercase placeholder:text-stone-400 shadow-sm" placeholder="Variant SKU Title" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["SIZE", "COLOR"].map(key => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest px-1">{key}</label>
                    <input type="text" value={variantForm.attributes[key]}
                      onChange={e => setVariantForm(p => ({ ...p, attributes: { ...p.attributes, [key]: e.target.value.toUpperCase() } }))}
                      className="w-full glass-input p-4 rounded-xl text-[11px] font-bold placeholder:text-stone-400 shadow-sm" placeholder={`Cluster ${key}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest px-1">Stock</label>
                  <input type="number" value={variantForm.stock} onChange={e => setVariantForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full glass-input p-4 rounded-xl text-[11px] font-mono placeholder:text-stone-400 shadow-sm" placeholder="Units" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest px-1">Currency</label>
                  <select value={variantForm.price.currency} onChange={e => setVariantForm(p => ({ ...p, price: { ...p.price, currency: e.target.value } }))}
                    className="w-full glass-input p-4 rounded-xl text-[11px] font-bold appearance-none cursor-pointer shadow-sm">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-stone-500 tracking-widest px-1">Price</label>
                <input type="number" value={variantForm.price.amount}
                  onChange={e => setVariantForm(p => ({ ...p, price: { ...p.price, amount: e.target.value } }))}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white p-4 text-3xl font-black text-stone-900 outline-none rounded-xl transition-all placeholder:text-stone-300 shadow-inner"
                  placeholder="0.00" />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 shrink-0 bg-white">
              <button disabled={isSubmitting} onClick={handleSaveVariant}
                className={`w-full bg-stone-900 text-white py-4 sm:py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-md ${isSubmitting ? "opacity-50 cursor-wait" : "hover:bg-[#ccff00] hover:text-stone-900 active:scale-[0.98]"}`}>
                {isSubmitting ? "Processing..." : editingIndex !== null ? "Update Protocol" : "Deploy to Registry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          variant={deleteTarget.variant}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SellerProductDetails;