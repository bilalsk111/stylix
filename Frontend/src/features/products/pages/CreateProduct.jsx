import React, { useState, useRef } from 'react';
import { X, ArrowLeft, Loader2, Plus, Sparkles, ShieldCheck, Palette, Ruler, Tag, Layers, Coins } from 'lucide-react';
import { useProduct } from '../hook/useProduct';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MEN',
    subCategory: '',
    collectionName: '',
    tags: '',
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (images.length + validFiles.length > 7) {
      toast.error("Max 7 assets allowed.");
      return;
    }
    setImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  const validate = () => {
    let e = {};
    if (!formData.title.trim()) e.title = "TITLE REQUIRED";
    if (!formData.priceAmount || formData.priceAmount <= 0) e.priceAmount = "PRICE REQUIRED";
    if (images.length === 0) e.images = "UPLOAD AT LEAST ONE IMAGE";
    
    setErrors(e);
    if (Object.keys(e).length > 0) toast.error("Please fill required fields");
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
      dataToSubmit.append('category', formData.category);
      dataToSubmit.append('subCategory', formData.subCategory);
      dataToSubmit.append('collectionName', formData.collectionName);
      dataToSubmit.append('tags', formData.tags);
      dataToSubmit.append('priceAmount', formData.priceAmount);
      dataToSubmit.append('priceCurrency', formData.priceCurrency);
      dataToSubmit.append('stock', formData.stock);

      const finalAttributes = {
        COLOR: formData.color.toUpperCase() || 'N/A',
        SIZE: formData.size.toUpperCase() || 'N/A'
      };
      dataToSubmit.append('attributes', JSON.stringify(finalAttributes));

      images.forEach((image) => dataToSubmit.append('images', image));

      await handleCreateProduct(dataToSubmit);
      navigate('/seller/dashboard');
    } catch (error) {
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 flex flex-col lg:flex-row font-sans selection:bg-[#c8ff00] selection:text-stone-900">

      {/* LEFT PANEL: ASSET GALLERY */}
      {/* 🔥 FIX: Outer section freely stretches to the full height of the parent. No sticky or h-screen here. */}
      <section className="w-full lg:w-[42%] bg-white border-b lg:border-b-0 lg:border-r border-stone-200 shrink-0 z-10">
        
        {/* 🔥 FIX: Inner div handles the sticky behavior and viewport height so background doesn't cut off */}
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col w-full">
          <div className="p-4 lg:p-6 flex justify-between items-center bg-white/90 backdrop-blur-2xl z-20 sticky top-0 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="h-4 w-[3px] bg-[#c8ff00] rounded-full shadow-[0_0_10px_rgba(200,255,0,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-900">Archive Visuals</span>
            </div>
            <span className={`text-[9px] font-bold tracking-[0.2em] uppercase bg-stone-50 px-3 py-1.5 rounded-none border ${errors.images ? 'border-red-400 text-red-500 bg-red-50' : 'border-stone-200 text-stone-500'}`}>
              {previewUrls.length} / 07 Slots
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-[radial-gradient(circle_at_top_left,_#f5f5f4_0%,_transparent_40%)]">
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, i) => (
                <div key={i} className={`relative group bg-stone-100 border border-stone-200 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-400 ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-[4/5]'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button type="button" onClick={() => {
                    setImages(images.filter((_, idx) => idx !== i));
                    setPreviewUrls(previewUrls.filter((_, idx) => idx !== i));
                  }} className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-none border border-stone-200 text-stone-900 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 transition-all z-10 shadow-sm active:scale-95">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              {previewUrls.length < 7 && (
                <div onClick={() => fileInputRef.current.click()} className="aspect-[4/5] border-2 border-dashed border-stone-200 hover:border-stone-400 transition-all flex flex-col items-center justify-center gap-4 bg-stone-50/50 hover:bg-white group cursor-pointer overflow-hidden relative">
                  <div className="w-12 h-12 bg-white border border-stone-100 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
                    <Plus className="text-stone-400 group-hover:text-stone-900 transition-colors" size={20} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-black text-stone-400 group-hover:text-stone-900 uppercase tracking-[0.3em] transition-colors">Add Asset</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: CONFIGURATION */}
      <section className="w-full lg:w-[58%] bg-[#f7f6f4] flex flex-col relative">
        
        {/* Top Header Bar */}
        <div className="px-6 lg:px-12 py-4 lg:py-6 flex justify-between items-end sticky top-0 bg-[#f7f6f4]/95 backdrop-blur-xl z-30 border-b border-stone-200/80">
          <button type="button" onClick={() => navigate(-1)} className="h-10 w-10 flex items-center justify-center bg-white hover:bg-stone-900 hover:text-white transition-colors border border-stone-200 shadow-sm active:scale-95">
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Sparkles size={11} className="text-[#a3d100] animate-pulse" />
              <span className="text-[9px] font-black text-stone-500 tracking-[0.5em] uppercase">Development Lab</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-none text-stone-900">
              New Drop.
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 lg:px-12 pt-6 pb-24 lg:pb-32">

          <div className="bg-white p-6 lg:p-10 border border-stone-200 shadow-sm">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-2 bg-stone-900"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-900">Core Identity</h2>
            </div>
            
            <div className="space-y-8">
              <div className="group relative">
                <label className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors mb-2 block ${errors.title ? 'text-red-500' : 'text-stone-400 group-focus-within:text-stone-900'}`}>
                  {errors.title || 'Product Name'}
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-2xl md:text-3xl font-black uppercase transition-all focus:outline-none placeholder:text-stone-200 tracking-tight text-stone-900"
                  placeholder="E.G. NOIR BOX TEE"
                />
              </div>

              <div className="group relative">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 transition-colors mb-2 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-sm font-medium focus:outline-none transition-all placeholder:text-stone-200 resize-none leading-relaxed tracking-wide text-stone-900"
                  placeholder="Fabric composition, fit, and aesthetic details..."
                />
              </div>
            </div>

            <div className="my-10 border-t border-stone-100"></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-2 w-2 bg-stone-900"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-900">Classification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-2 block transition-colors">Department</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-[12px] font-black tracking-[0.2em] uppercase focus:outline-none cursor-pointer text-stone-900 transition-all appearance-none">
                  {["MEN", "WOMEN", "KID", "UNISEX"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={12} className="text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Sub Category</label>
                </div>
                <input
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-[12px] font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-200 text-stone-900 transition-all"
                  placeholder="E.G. HOODIES, TEES"
                />
              </div>

              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-2 block transition-colors">Collection</label>
                <input
                  name="collectionName"
                  value={formData.collectionName}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-[12px] font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-200 text-stone-900 transition-all"
                  placeholder="E.G. ARCHIVE VOL 01"
                />
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={12} className="text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Tags (Comma Separated)</label>
                </div>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-[12px] font-bold uppercase focus:outline-none tracking-widest placeholder:text-stone-200 text-stone-900 transition-all"
                  placeholder="E.G. WINTER, LIMITED"
                />
              </div>
            </div>

            <div className="my-10 border-t border-stone-100"></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-2 w-2 bg-stone-900"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-900">Initial Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={12} className="text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Base Color</label>
                </div>
                <input name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-lg font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-200 text-stone-900 transition-all" placeholder="E.G. ONYX BLACK" />
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={12} className="text-stone-400 group-focus-within:text-stone-900 transition-colors" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Standard Size</label>
                </div>
                <input name="size" value={formData.size} onChange={handleInputChange} className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-lg font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-200 text-stone-900 transition-all" placeholder="E.G. MEDIUM" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-stone-100">
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={12} className={errors.priceAmount ? 'text-red-500' : 'text-stone-400 group-focus-within:text-stone-900 transition-colors'} />
                  <label className={`text-[9px] font-black uppercase tracking-[0.4em] block transition-colors ${errors.priceAmount ? 'text-red-500' : 'text-stone-400 group-focus-within:text-stone-900'}`}>
                    {errors.priceAmount || 'Valuation'}
                  </label>
                </div>
                <input name="priceAmount" type="number" value={formData.priceAmount} onChange={handleInputChange} className="no-spinner w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-2xl font-black focus:outline-none tracking-tighter text-stone-900 placeholder:text-stone-200 transition-all" placeholder="0" />
              </div>
              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-2 block transition-colors">Currency</label>
                <select name="priceCurrency" value={formData.priceCurrency} onChange={handleInputChange} className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-[12px] font-black tracking-[0.2em] uppercase focus:outline-none cursor-pointer text-stone-900 transition-all appearance-none">
                  {["INR", "USD", "EUR", "GBP", "JPY"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-2 block transition-colors">Initial Inventory</label>
                <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="no-spinner w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-2 text-2xl font-black focus:outline-none text-stone-900 tracking-tighter placeholder:text-stone-200 transition-all" placeholder="1" />
              </div>
            </div>

          </div>

          <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />

          <div className="pt-8 pb-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white py-5 font-black uppercase tracking-[0.5em] text-[11px] hover:bg-[#c8ff00] hover:text-stone-900 transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] border border-stone-800 disabled:opacity-50 disabled:pointer-events-none">
              {isSubmitting ? <Loader2 className="animate-spin text-current" size={20} /> : (
                <>
                  <ShieldCheck size={18} />
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