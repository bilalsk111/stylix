import React, { useState, useRef } from 'react';
import { UploadCloud, X, ArrowLeft, Loader2, Plus, Sparkles, ShieldCheck, Scissors, Anchor } from 'lucide-react';
import { useProduct } from '../hook/useProduct';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', description: '', priceAmount: '', priceCurrency: 'INR' });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
const {handleCreateProduct} = useProduct();
const navigate = useNavigate();
  const handleCreate = async (dataToSubmit) => {
    const data = await handleCreateProduct(dataToSubmit);
    return data.product;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "priceAmount" && value < 0) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (images.length + validFiles.length > 7) return;
    setImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  const validate = () => {
    let e = {};
    if (!formData.title.trim()) e.title = "REQUIRED";
    if (!formData.description.trim()) e.description = "REQUIRED";
    if (!formData.priceAmount || formData.priceAmount <= 0) e.priceAmount = "INVALID";
    if (images.length === 0) e.images = "ASSET_REQUIRED";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('title', formData.title);
      dataToSubmit.append('description', formData.description);
      dataToSubmit.append('priceAmount', formData.priceAmount);
      dataToSubmit.append('priceCurrency', formData.priceCurrency);
      
      images.forEach((image) => {
        dataToSubmit.append('images', image);
      });

      const product = await handleCreate(dataToSubmit);
      console.log("Product created successfully:", product);

      navigate('/seller/dashboard')
      
    } catch (error) {
      console.error("Failed to create product:", error);
      setErrors(prev => ({ ...prev, submit: "Deployment failed. Check connection." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      <section className="w-full lg:w-[42%] h-[35vh] lg:h-full bg-[#080808] border-b lg:border-b-0 lg:border-r border-neutral-900 flex flex-col relative shrink-0">
        <div className="p-4 lg:p-8 flex justify-between items-center bg-[#080808]/90 backdrop-blur-xl z-20 sticky top-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-[2px] bg-[#ccff00]"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Atelier Assets</span>
          </div>
          <span className="text-[7px] font-bold text-neutral-600 tracking-widest uppercase">07 Slots</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-3">
            {previewUrls.map((url, i) => (
              <div key={i} className={`relative group bg-[#111] border border-neutral-800 transition-all ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                <img src={url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" />
                <button type="button" onClick={() => {
                  setImages(images.filter((_, idx) => idx !== i));
                  setPreviewUrls(previewUrls.filter((_, idx) => idx !== i));
                }} className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full border border-white/10 hover:bg-red-500">
                  <X size={10} />
                </button>
              </div>
            ))}
            <div onClick={() => fileInputRef.current.click()} className="aspect-square border border-dashed border-neutral-800 hover:border-[#ccff00]/30 transition-all flex flex-col items-center justify-center gap-2 bg-[#0a0a0a] group cursor-pointer">
              <Plus className="text-neutral-700 group-hover:text-[#ccff00] transition-transform group-hover:rotate-90" size={18} />
              <span className="text-[7px] font-black text-neutral-800 uppercase">Upload</span>
            </div>
          </div>
          
          {/* Desktop Only Deco */}
          <div className="hidden lg:block mt-8 space-y-3 opacity-30">
            <div className="flex items-center gap-3"><Scissors size={10} className="text-[#ccff00]" /><p className="text-[7px] uppercase tracking-widest">Tailored Previews</p></div>
            <div className="flex items-center gap-3"><Anchor size={10} className="text-[#ccff00]" /><p className="text-[7px] uppercase tracking-widest">Quality Locked</p></div>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-[58%] h-[65vh] lg:h-full bg-[#050505] flex flex-col relative">
        <div className="px-6 lg:px-12 py-6 lg:py-10 flex justify-between items-end sticky top-0 bg-[#050505] z-30">
          <button onClick={()=>navigate(-1)} className="h-9 w-9 flex items-center justify-center bg-[#111] hover:bg-[#ccff00] hover:text-black transition-all rounded-full border border-white/5">
            <ArrowLeft size={14} />
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Sparkles size={10} className="text-[#ccff00]" />
              <span className="text-[8px] font-black text-[#ccff00] tracking-[0.4em] uppercase underline underline-offset-4">Phase 02</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic">The Vault.</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 lg:px-12 pb-10 space-y-8 lg:space-y-12 custom-scrollbar">
          
          <div className="space-y-8 lg:space-y-12">
            <div className="group relative">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 group-focus-within:text-[#ccff00] transition-colors mb-2 block">Archive Piece Identity</label>
              <input 
                name="title"
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-neutral-800 focus:border-[#ccff00] py-2 text-lg lg:text-xl font-black uppercase transition-all focus:outline-none placeholder:text-neutral-900"
                placeholder="Product Name..."
              />
            </div>

            <div className="group relative">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 group-focus-within:text-[#ccff00] transition-colors mb-2 block">The Narrative</label>
              <textarea 
                name="description"
                onChange={handleInputChange}
                rows="1"
                className="w-full bg-transparent border-b border-neutral-800 focus:border-[#ccff00] py-2 text-[11px] font-medium focus:outline-none transition-all placeholder:text-neutral-900 resize-none"
                placeholder="Fit and fabric details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6 lg:gap-10">
              <div className="group">
                <label className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-2 block">Valuation</label>
                <div className="flex items-center border-b border-neutral-800 focus-within:border-[#ccff00] transition-all">
                  <span className="text-neutral-700 font-black text-sm mr-2">/</span>
                  <input name="priceAmount" type="number" min="0" onChange={handleInputChange} className="no-spinner w-full bg-transparent py-2 text-base font-black focus:outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="group">
                <label className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.3em] mb-2 block">Currency</label>
                <select name="priceCurrency" onChange={handleInputChange} className="w-full bg-transparent border-b border-neutral-800 py-2.5 text-[10px] font-black tracking-widest uppercase focus:outline-none cursor-pointer">
                  {["INR", "USD", "EUR", "GBP"].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />

          <div className="pt-4 pb-10">
            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-5 lg:py-6 font-black uppercase tracking-[0.5em] text-[10px] hover:bg-[#ccff00] transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <>
                  <ShieldCheck size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                  Confirm Deployment
                </>
              )}
            </button>
            <div className="mt-8 flex justify-between items-center opacity-10">
               <span className="text-[7px] font-black uppercase tracking-widest italic">Stylix.Vault</span>
               <div className="h-[1px] w-12 bg-white"></div>
               <span className="text-[7px] font-black uppercase tracking-[0.3em]">Encrypted Session</span>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateProduct;