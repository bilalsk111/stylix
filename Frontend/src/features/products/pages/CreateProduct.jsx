import React, { useState, useRef } from 'react';
import { X, ArrowLeft, Loader2, Plus, Sparkles, ShieldCheck, Palette, Ruler } from 'lucide-react';
import { useProduct } from '../hook/useProduct';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();

  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    priceAmount: '', 
    priceCurrency: 'INR',
    stock: '1',
    color: '', 
    size: '' 
  });
  
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
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
    if (!formData.title.trim()) e.title = "TITLE REQUIRED";
    if (!formData.priceAmount || formData.priceAmount <= 0) e.priceAmount = "PRICE REQUIRED";
    if (images.length === 0) e.images = "UPLOAD AT LEAST ONE IMAGE";
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
      dataToSubmit.append('stock', formData.stock);
      
      // Simplify attributes to just Color and Size
      const finalAttributes = { 
        COLOR: formData.color.toUpperCase() || 'N/A', 
        SIZE: formData.size.toUpperCase() || 'N/A' 
      };
      dataToSubmit.append('attributes', JSON.stringify(finalAttributes));
      
      images.forEach((image) => {
        dataToSubmit.append('images', image);
      });

      const response = await handleCreateProduct(dataToSubmit);
      
      if(response) {
        navigate('/seller/dashboard');
      }
    } catch (error) {
      console.error("Critical Deployment Error:", error);
      alert("Backend Error: " + (error.response?.data?.message || "Check Console"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* LEFT PANEL: ASSET GALLERY */}
      <section className="w-full lg:w-[42%] h-[35vh] lg:h-full bg-[#080808] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col relative shrink-0">
        <div className="p-4 lg:p-8 flex justify-between items-center bg-[#080808]/90 backdrop-blur-2xl z-20 sticky top-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-4 w-[3px] bg-[#ccff00] rounded-full shadow-[0_0_10px_#ccff00]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-200">Archive Visuals</span>
          </div>
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase bg-white/5 px-3 py-1 rounded-full border ${errors.images ? 'border-red-500 text-red-500' : 'border-white/5 text-neutral-500'}`}>
            {previewUrls.length} / 07 Slots
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_left,_#111111_0%,_transparent_40%)]">
          <div className="grid grid-cols-2 gap-4">
            {previewUrls.map((url, i) => (
              <div key={i} className={`relative group bg-[#111] border border-white/5 transition-all duration-500 rounded-xl overflow-hidden shadow-2xl hover:border-[#ccff00]/30 ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                <img src={url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" />
                <button type="button" onClick={() => {
                  setImages(images.filter((_, idx) => idx !== i));
                  setPreviewUrls(previewUrls.filter((_, idx) => idx !== i));
                }} className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-red-500/80 hover:scale-110 transition-all z-10">
                  <X size={14} />
                </button>
              </div>
            ))}
            {previewUrls.length < 7 && (
              <div onClick={() => fileInputRef.current.click()} className="aspect-square border-2 border-dashed border-white/5 hover:border-[#ccff00]/40 transition-all flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:bg-[#ccff00]/5 group cursor-pointer rounded-xl overflow-hidden relative">
                <Plus className="text-neutral-600 group-hover:text-[#ccff00] transition-all group-hover:rotate-90 group-hover:scale-110" size={28} />
                <span className="text-[9px] font-black text-neutral-500 group-hover:text-neutral-300 uppercase tracking-[0.3em]">Add Asset</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: CONFIGURATION */}
      <section className="w-full lg:w-[58%] h-[65vh] lg:h-full bg-[#050505] flex flex-col relative">
        <div className="px-6 lg:px-12 py-6 lg:py-12 flex justify-between items-end sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-30 border-b border-white/[0.02]">
          <button onClick={()=>navigate(-1)} className="h-11 w-11 flex items-center justify-center bg-white/5 hover:bg-[#ccff00] hover:text-black transition-all rounded-full border border-white/10 shadow-lg">
            <ArrowLeft size={18} />
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Sparkles size={11} className="text-[#ccff00] animate-pulse" />
              <span className="text-[9px] font-black text-[#ccff00] tracking-[0.5em] uppercase">Development</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">New Drop.</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 lg:px-12 pb-24 space-y-16 custom-scrollbar pt-8">
          
          <div className="space-y-14">
            {/* Title & Description */}
            <div className="space-y-10">
              <div className="group relative">
                <label className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors mb-3 block ${errors.title ? 'text-red-500' : 'text-neutral-500 group-focus-within:text-[#ccff00]'}`}>
                  {errors.title || 'Product Name'}
                </label>
                <input 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#ccff00] py-4 text-3xl font-black uppercase transition-all focus:outline-none placeholder:text-neutral-900 tracking-tight"
                  placeholder="E.G. NOIR BOX TEE"
                />
              </div>

              <div className="group relative">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-500 group-focus-within:text-[#ccff00] transition-colors mb-3 block">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#ccff00] py-4 text-sm font-medium focus:outline-none transition-all placeholder:text-neutral-900 resize-none leading-relaxed tracking-wide"
                  placeholder="Fabric composition, fit, and aesthetic details..."
                />
              </div>
            </div>

            {/* SIZE & COLOR SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={12} className="text-neutral-500 group-focus-within:text-[#ccff00]" />
                  <label className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] block">Base Color</label>
                </div>
                <input 
                  name="color" 
                  value={formData.color}
                  onChange={handleInputChange} 
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#ccff00] py-4 text-xl font-black uppercase focus:outline-none tracking-widest placeholder:text-neutral-900" 
                  placeholder="E.G. ONYX BLACK" 
                />
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={12} className="text-neutral-500 group-focus-within:text-[#ccff00]" />
                  <label className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] block">Standard Size</label>
                </div>
                <input 
                  name="size" 
                  value={formData.size}
                  onChange={handleInputChange} 
                  className="w-full bg-transparent border-b border-white/10 focus:border-[#ccff00] py-4 text-xl font-black uppercase focus:outline-none tracking-widest placeholder:text-neutral-900" 
                  placeholder="E.G. MEDIUM / OVERSIZED" 
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="group">
                <label className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 block ${errors.priceAmount ? 'text-red-500' : 'text-neutral-500'}`}>
                  {errors.priceAmount || 'Valuation'}
                </label>
                <div className="flex items-center border-b border-white/10 group-focus-within:border-[#ccff00] transition-all">
                  <input 
                    name="priceAmount" 
                    type="number" 
                    value={formData.priceAmount}
                    onChange={handleInputChange} 
                    className="no-spinner w-full bg-transparent py-4 text-2xl font-black focus:outline-none tracking-tighter" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div className="group">
                <label className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] mb-3 block">Currency</label>
                <select name="priceCurrency" value={formData.priceCurrency} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 py-5 text-[11px] font-black tracking-[0.2em] uppercase focus:outline-none cursor-pointer">
                  {["INR", "USD", "EUR"].map(c => <option key={c} value={c} className="bg-[#111] text-white">{c}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em] mb-3 block">Inventory</label>
                <div className="flex items-center border-b border-white/10 group-focus-within:border-[#ccff00] transition-all">
                  <input 
                    name="stock" 
                    type="number" 
                    value={formData.stock}
                    onChange={handleInputChange} 
                    className="no-spinner w-full bg-transparent py-4 text-2xl font-black focus:outline-none text-[#ccff00] tracking-tighter" 
                    placeholder="1" 
                  />
                </div>
              </div>
            </div>
          </div>

          <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />

          <div className="pt-8">
            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-8 font-black uppercase tracking-[0.8em] text-[12px] hover:bg-[#ccff00] transition-all active:scale-[0.98] flex items-center justify-center gap-4 relative shadow-[0_20px_50px_rgba(0,0,0,0.4)] group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <>
                  <ShieldCheck size={20} className="opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  Deploy to Collection
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateProduct;