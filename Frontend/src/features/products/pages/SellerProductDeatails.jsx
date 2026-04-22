import React, { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, X, ArrowLeft, Edit3, Fingerprint, Box, 
  ShieldCheck, ShoppingBag, Globe, Cpu, MoveRight, Layers, Zap,
  ImagePlus
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
  .editorial-title { line-height: 0.8; letter-spacing: -0.05em; font-style: italic; }
`;

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
          <span key={item} className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 cursor-pointer transition-colors">{item}</span>
        ))}
      </div>
    </nav>
  );
});

const VariantCard = memo(({ variant, index, onEdit }) => (
  <div className="group bg-white border border-stone-200 p-4 rounded-xl hover:border-stone-300 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-3">
        <div className="w-12 h-14 bg-stone-100 rounded-md overflow-hidden border border-stone-200">
          {variant.images?.[0] && <img src={variant.images[0].url} className="w-full h-full object-cover grayscale" alt="" />}
        </div>
        <div>
          <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">NODE_0{index + 1}</span>
          <h4 className="text-xs font-bold uppercase text-stone-900">{variant.title || "Standard SKU"}</h4>
        </div>
      </div>
      <button onClick={() => onEdit(index)} className="p-2 text-stone-400 hover:text-stone-900"><Edit3 size={12} /></button>
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
  // 💡 IMPORT handleEditVariant FROM HOOK
  const { handleGetProductById, handleAddProductVariant, handleEditVariant } = useProduct();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [variantForm, setVariantForm] = useState(DEFAULT_VARIANT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    handleGetProductById(id).then(data => { 
      if(isMounted) {
        setProduct(data); 
        setLoading(false); 
      }
    });
    return () => { isMounted = false; };
  }, [id, handleGetProductById]);

  const toggleModal = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      // 💡 Populating form for Editing
      const variantToEdit = product.variants[index];
      setVariantForm({
        title: variantToEdit.title || "",
        attributes: variantToEdit.attributes || { SIZE: "", COLOR: "" },
        stock: variantToEdit.stock || "",
        price: { 
          amount: variantToEdit.price?.amount || "", 
          currency: variantToEdit.price?.currency || "INR" 
        },
        images: variantToEdit.images || []
      });
    } else {
      setVariantForm(DEFAULT_VARIANT_FORM);
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = variantForm.images || [];

    if (currentImages.length + files.length > 7) {
      toast.error("Max 7 imagery assets allowed.", { style: { background: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }});
    }

    const allowedSlots = 7 - currentImages.length;
    const filesToAdd = files.slice(0, allowedSlots).map(file => ({
      file: file, 
      url: URL.createObjectURL(file) 
    }));

    setVariantForm(prev => ({
      ...prev,
      images: [...currentImages, ...filesToAdd]
    }));
  };

  const removeImage = (indexToRemove) => {
    setVariantForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveVariant = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: variantForm.title,
        stock: Number(variantForm.stock),
        price: {
          amount: Number(variantForm.price.amount),
          currency: variantForm.price.currency
        },
        attributes: variantForm.attributes,
        images: variantForm.images 
      };

      let response;

      // 💡 BRANCHING LOGIC: EDIT vs ADD
      if (editingIndex !== null) {
        const variantId = product.variants[editingIndex]._id;
        response = await handleEditVariant(id, variantId, payload);
      } else {
        response = await handleAddProductVariant(id, payload);
      }
      
      setProduct(response?.product || response?.data || response);
      setVariantForm(DEFAULT_VARIANT_FORM);
      setIsModalOpen(false);
      
      // 💡 DYNAMIC SUCCESS MESSAGE
      const successMsg = editingIndex !== null ? "Node Protocol Updated." : "Node Cluster Deployed.";
      toast.success(successMsg, { style: { background: '#1c1917', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }});
      
      setEditingIndex(null); // Reset after save
      
    } catch (error) {
      console.error("Deploy/Update Node Failed:", error);
      toast.error("Process failed. Check console.", { style: { background: '#1c1917', color: '#ef4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen bg-[#f7f6f4] flex items-center justify-center text-stone-900 font-black text-[10px] tracking-[1em] animate-pulse">LOADING_NEXUS</div>;

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      <style>{globalStyles}</style>
      <Toaster position="top-right" />
      <Navbar productId={product?._id} />

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* IMAGE GALLERY */}
          <div className="lg:col-span-7 flex gap-4 h-[700px]">
            <div className="flex flex-col gap-2 w-16 no-scrollbar overflow-y-auto">
              {product?.images?.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-[3/4] w-full rounded-md overflow-hidden border transition-all ${activeImg === i ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 opacity-60 hover:opacity-100"}`}>
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="flex-1 bg-stone-100 rounded-2xl overflow-hidden relative group border border-stone-200 shadow-sm">
              <img src={product?.images?.[activeImg]?.url} className="w-full h-full object-cover" alt="" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-white text-stone-900 px-4 py-2 text-[8px] font-black uppercase tracking-widest border border-stone-200 shadow-sm rounded-sm">
                  MASTER_VIEW_0{activeImg + 1}
                </span>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO & VARIANTS */}
          <div className="lg:col-span-5">
            <header className="mb-10">
              <div className="flex gap-4 mb-4">
                <span className="text-stone-600 text-[8px] font-black uppercase tracking-[0.3em] bg-stone-200/50 px-3 py-1.5 border border-stone-200 rounded-sm flex items-center gap-2">
                  <ShieldCheck size={10} /> ASSET_ENCRYPTED
                </span>
              </div>
              
              <h1 className="text-7xl font-black uppercase editorial-title mb-8 text-stone-900">
                {product?.title}
              </h1>

              <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                  { label: "Season", val: "SS/26", icon: <Layers size={12}/> },
                  { label: "Material", val: "Tech Silk", icon: <Cpu size={12}/> },
                  { label: "Fit", val: "Boxy", icon: <MoveRight size={12}/> }
                ].map(spec => (
                  <div key={spec.label} className="border border-stone-200 bg-white p-3 rounded-xl shadow-sm">
                    <span className="text-[7px] font-black text-stone-400 uppercase block mb-1">{spec.label}</span>
                    <span className="text-[10px] font-bold uppercase text-stone-900">{spec.val}</span>
                  </div>
                ))}
              </div>
            </header>

            <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-stone-900">
                  <ShoppingBag size={14} className="text-stone-900" /> Node Clusters
                </h2>
                <button onClick={() => toggleModal()} className="bg-stone-900 text-white px-5 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-md hover:bg-[#ccff00] hover:text-stone-900 transition-colors shadow-sm">
                  + Add Node
                </button>
              </div>

              <div className="grid gap-3">
                {product?.variants?.map((v, idx) => <VariantCard key={idx} variant={v} index={idx} onEdit={toggleModal} />)}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* LIGHT THEME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center shrink-0 bg-stone-50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
                {/* 💡 DYNAMIC MODAL TITLE */}
                {editingIndex !== null ? "Modify Node Protocol" : "Deploy Node Cluster"}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingIndex(null); }} className="text-stone-400 hover:text-stone-900 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              
              {/* IMAGE UPLOADER */}
              <div className="space-y-3 p-1">
                <div className="flex items-baseline justify-between">
                  <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest block mb-1">Variant Asset Imagery (Max 7)</label>
                  <span className="text-[8px] font-black text-stone-900">{variantForm.images?.length || 0} / 7</span>
                </div>
                
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {variantForm.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] w-16 h-20 shrink-0 border border-stone-200 rounded-lg overflow-hidden group">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity border border-stone-200 shadow-sm">
                        <X size={10} className="text-stone-900 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                  
                  {(variantForm.images?.length || 0) < 7 && (
                    <label className="aspect-[3/4] w-16 h-20 shrink-0 border border-dashed border-stone-300 rounded-lg flex flex-col gap-1 items-center justify-center cursor-pointer group hover:border-stone-900 transition-colors bg-stone-50 hover:bg-stone-100">
                      <ImagePlus size={16} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-[0.3em] text-stone-400 group-hover:text-stone-900 transition-colors">ADD</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1 p-1">
                <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest">Title</label>
                <input type="text" value={variantForm.title} onChange={(e) => setVariantForm(p => ({...p, title: e.target.value}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold uppercase placeholder:text-stone-400" placeholder="Variant SKU Title" />
              </div>

              {/* Attributes Inputs */}
              <div className="grid grid-cols-2 gap-4 p-1">
                {["SIZE", "COLOR"].map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest">{key}</label>
                    <input type="text" value={variantForm.attributes[key]} onChange={(e) => setVariantForm(p => ({...p, attributes: {...p.attributes, [key]: e.target.value.toUpperCase()}}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold placeholder:text-stone-400" placeholder={`Cluster ${key}`} />
                  </div>
                ))}
              </div>

              {/* Stock and Price Inputs */}
              <div className="grid grid-cols-2 gap-4 p-1">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest">Inventory Stock</label>
                  <input type="number" value={variantForm.stock} onChange={(e) => setVariantForm(p => ({...p, stock: e.target.value}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-mono placeholder:text-stone-400" placeholder="UNITS_IN_VAULT" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest">Pricing Currency</label>
                  <select value={variantForm.price.currency} onChange={(e) => setVariantForm(p => ({...p, price: {...p.price, currency: e.target.value}}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold appearance-none cursor-pointer">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1 p-1">
                <label className="text-[8px] font-black uppercase text-stone-500 tracking-widest">Registry Price</label>
                <input type="number" value={variantForm.price.amount} onChange={(e) => setVariantForm(p => ({...p, price: {...p.price, amount: e.target.value}}))} className="w-full bg-stone-100 border border-stone-200 focus:border-stone-900 focus:bg-white p-4 text-2xl font-black text-stone-900 italic outline-none rounded-xl transition-all placeholder:text-stone-300" placeholder="NEXUS_VALUATION" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 border-t border-stone-100 shrink-0 bg-white">
              <button 
                disabled={isSubmitting} 
                onClick={handleSaveVariant} 
                className={`w-full bg-stone-900 text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-md ${isSubmitting ? "opacity-50 cursor-wait" : "hover:bg-[#ccff00] hover:text-stone-900 hover:-translate-y-0.5"}`}
              >
                {/* 💡 DYNAMIC BUTTON TEXT */}
                {isSubmitting 
                  ? "Processing Protocol..." 
                  : (editingIndex !== null ? "Update Registry Protocol" : "Deploy to Registry")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDetails;