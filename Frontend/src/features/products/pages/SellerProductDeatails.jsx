import React, { useState, useEffect, memo, useMemo } from "react";
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
  .glass-input { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s ease; }
  .glass-input:focus { border-color: #ccff00; background: rgba(204, 255, 0, 0.03); }
  .editorial-title { line-height: 0.8; letter-spacing: -0.05em; font-style: italic; }
`;

const Navbar = memo(({ productId }) => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.03] px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 border border-white/10 rounded-full hover:border-[#ccff00] transition-all">
          <ArrowLeft size={14} />
        </button>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Registry Control</span>
          <span className="text-[10px] font-mono text-white/60">NODE_{productId?.slice(-6).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-8">
        {['Overview', 'Analytics', 'Logistics'].map(item => (
          <span key={item} className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-[#ccff00] cursor-pointer transition-colors">{item}</span>
        ))}
      </div>
    </nav>
  );
});

const VariantCard = memo(({ variant, index, onEdit }) => (
  <div className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-xl hover:border-white/10 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-3">
        <div className="w-12 h-14 bg-neutral-900 rounded-md overflow-hidden border border-white/5">
          {variant.images?.[0] && <img src={variant.images[0].url} className="w-full h-full object-cover grayscale" alt="" />}
        </div>
        <div>
          <span className="text-[8px] font-black text-[#ccff00] uppercase tracking-tighter opacity-50">NODE_0{index + 1}</span>
          <h4 className="text-xs font-bold uppercase text-white/90">{variant.title || "Standard SKU"}</h4>
        </div>
      </div>
      <button onClick={() => onEdit(index)} className="p-2 text-white/10 hover:text-[#ccff00]"><Edit3 size={12} /></button>
    </div>
    <div className="flex justify-between items-end border-t border-white/5 pt-3">
      <div>
        <span className="text-[7px] font-black text-white/20 uppercase block">Stock</span>
        <span className="text-[10px] font-mono text-white/80">{variant.stock} Units</span>
      </div>
      <div className="text-right">
        <span className="text-[7px] font-black text-white/20 uppercase block">Price</span>
        <span className="text-[10px] font-mono text-[#ccff00]">{variant.price?.currency} {variant.price?.amount}</span>
      </div>
    </div>
  </div>
));

const SellerProductDetails = () => {
  const { id } = useParams();
  const { handleGetProductById, handleAddProductVariant } = useProduct();
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
    setVariantForm(index !== null ? product.variants[index] : DEFAULT_VARIANT_FORM);
    setIsModalOpen(!isModalOpen);
  };


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = variantForm.images || [];

    if (currentImages.length + files.length > 7) {
      toast.error("Max 7 imagery assets allowed.", { style: { background: '#0a0a0a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }});
    }

    const allowedSlots = 7 - currentImages.length;
    
    // Yahan hum img object create kar rahe hain exact us format mein jo aapka backend maang raha hai
    // { file: FileObject, url: PreviewURL }
    const filesToAdd = files.slice(0, allowedSlots).map(file => ({
      file: file, 
      url: URL.createObjectURL(file) // For live preview
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
        images: variantForm.images // Yeh array ab object `{file: ..., url: ...}` hold karta hai
      };

      const response = await handleAddProductVariant(id, payload);
      
      setProduct(response?.product || response?.data || response);
      setVariantForm(DEFAULT_VARIANT_FORM);
      setIsModalOpen(false);
      toast.success("Node Cluster Deployed.", { style: { background: '#0a0a0a', color: '#ccff00', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }});
      
    } catch (error) {
      console.error("Deploy Node Failed:", error);
      toast.error("Deployment failed. Check console.", { style: { background: '#0a0a0a', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}); 
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-[#ccff00] font-black text-[10px] tracking-[1em] animate-pulse">LOADING_NEXUS</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black">
      <style>{globalStyles}</style>
      <Toaster position="top-right" />
      <Navbar productId={product?._id} />

      <main className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 flex gap-4 h-[700px]">
            <div className="flex flex-col gap-2 w-16 no-scrollbar overflow-y-auto">
              {product?.images?.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-[3/4] w-full rounded-md overflow-hidden border transition-all ${activeImg === i ? "border-[#ccff00]" : "border-white/5 opacity-40"}`}>
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="flex-1 bg-neutral-900 rounded-2xl overflow-hidden relative group">
              <img src={product?.images?.[activeImg]?.url} className="w-full h-full object-cover" alt="" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-[#ccff00] text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest">MASTER_VIEW_0{activeImg + 1}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <header className="mb-10">
              <div className="flex gap-4 mb-4">
                <span className="text-[#ccff00] text-[8px] font-black uppercase tracking-[0.3em] bg-[#ccff00]/5 px-2 py-1 border border-[#ccff00]/10 rounded-sm flex items-center gap-2">
                  <ShieldCheck size={10} /> ASSET_ENCRYPTED
                </span>
              </div>
              
              <h1 className="text-7xl font-black uppercase editorial-title mb-8">
                {product?.title}
              </h1>

              <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                  { label: "Season", val: "SS/26", icon: <Layers size={12}/> },
                  { label: "Material", val: "Tech Silk", icon: <Cpu size={12}/> },
                  { label: "Fit", val: "Boxy", icon: <MoveRight size={12}/> }
                ].map(spec => (
                  <div key={spec.label} className="border border-white/5 p-3 rounded-lg">
                    <span className="text-[7px] font-black text-white/20 uppercase block mb-1">{spec.label}</span>
                    <span className="text-[10px] font-bold uppercase text-white/70">{spec.val}</span>
                  </div>
                ))}
              </div>
            </header>

            <section className="bg-[#080808] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#ccff00]" /> Node Clusters
                </h2>
                <button onClick={() => toggleModal()} className="bg-white text-black px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-[#ccff00] transition-colors">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0c0c0c] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Deploy Node Cluster</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              
              {/* IMAGE UPLOADER SECTION (MAX 7) */}
              <div className="space-y-3 p-1">
                <div className="flex items-baseline justify-between">
                  <label className="text-[8px] font-black uppercase text-white/20 tracking-widest block mb-1">Variant Asset Imagery (Max 7)</label>
                  <span className="text-[8px] font-black text-[#ccff00]">{variantForm.images?.length || 0} / 7</span>
                </div>
                
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {variantForm.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] w-16 h-20 shrink-0 border border-white/10 rounded-lg overflow-hidden group">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} className="text-white hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                  
                  {(variantForm.images?.length || 0) < 7 && (
                    <label className="aspect-[3/4] w-16 h-20 shrink-0 border border-dashed border-white/10 rounded-lg flex flex-col gap-1 items-center justify-center cursor-pointer group hover:border-[#ccff00] transition-colors bg-[#080808]">
                      <ImagePlus size={16} className="text-white/30 group-hover:text-[#ccff00] transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-[#ccff00] transition-colors">ADD</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1 p-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">Title</label>
                <input type="text" value={variantForm.title} onChange={(e) => setVariantForm(p => ({...p, title: e.target.value}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold uppercase outline-none" placeholder=" Variant SKU Title " />
              </div>

              <div className="grid grid-cols-2 gap-4 p-1">
                {["SIZE", "COLOR"].map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">{key}</label>
                    <input type="text" value={variantForm.attributes[key]} onChange={(e) => setVariantForm(p => ({...p, attributes: {...p.attributes, [key]: e.target.value.toUpperCase()}}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold outline-none placeholder:text-white/20" placeholder={`Cluster ${key}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 p-1">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">Inventory Stock</label>
                  <input type="number" value={variantForm.stock} onChange={(e) => setVariantForm(p => ({...p, stock: e.target.value}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-mono outline-none" placeholder=" UNITS_IN_VAULT " />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">Pricing Currency</label>
                  <select value={variantForm.price.currency} onChange={(e) => setVariantForm(p => ({...p, price: {...p.price, currency: e.target.value}}))} className="w-full glass-input p-3 rounded-lg text-[10px] font-bold text-white outline-none appearance-none bg-black">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1 p-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">Registry Price</label>
                <input type="number" value={variantForm.price.amount} onChange={(e) => setVariantForm(p => ({...p, price: {...p.price, amount: e.target.value}}))} className="w-full bg-[#ccff00]/5 border border-[#ccff00]/20 p-4 text-2xl font-black text-[#ccff00] italic outline-none rounded-xl" placeholder=" NEXUS_VALUATION " />
              </div>
            </div>

            <div className="p-6 border-t border-white/5 shrink-0 bg-[#0c0c0c]">
              <button 
                disabled={isSubmitting} 
                onClick={handleSaveVariant} 
                className={`w-full bg-[#ccff00] text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-transform ${isSubmitting ? "opacity-50 cursor-wait" : "hover:scale-[1.02]"}`}
              >
                {isSubmitting ? "Deploying Cluster Assets..." : "Deploy to Registry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductDetails;