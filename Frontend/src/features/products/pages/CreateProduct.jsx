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
    size: '',
    category: 'MEN'
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
      dataToSubmit.append('category', formData.category);

      const finalAttributes = {
        COLOR: formData.color.toUpperCase() || 'N/A',
        SIZE: formData.size.toUpperCase() || 'N/A'
      };
      dataToSubmit.append('attributes', JSON.stringify(finalAttributes));

      images.forEach((image) => {
        dataToSubmit.append('images', image);
      });

      const response = await handleCreateProduct(dataToSubmit);

      if (response) {
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
    // LIGHT THEME BACKGROUND
    <div className="h-screen w-full bg-[#f7f6f4] text-stone-900 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-stone-900 selection:text-white">

      {/* LEFT PANEL: ASSET GALLERY */}
      <section className="w-full lg:w-[42%] h-[35vh] lg:h-full bg-white border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col relative shrink-0">
        <div className="p-4 lg:p-8 flex justify-between items-center bg-white/90 backdrop-blur-2xl z-20 sticky top-0 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="h-4 w-[3px] bg-[#c8ff00] rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-900">Archive Visuals</span>
          </div>
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase bg-stone-50 px-3 py-1 rounded-full border ${errors.images ? 'border-red-400 text-red-500' : 'border-stone-200 text-stone-500'}`}>
            {previewUrls.length} / 07 Slots
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_left,_#f5f5f4_0%,_transparent_40%)]">
          <div className="grid grid-cols-2 gap-4">
            {previewUrls.map((url, i) => (
              <div key={i} className={`relative group bg-stone-100 border border-stone-200 transition-all duration-500 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-stone-400 ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                <img src={url} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" />
                <button type="button" onClick={() => {
                  setImages(images.filter((_, idx) => idx !== i));
                  setPreviewUrls(previewUrls.filter((_, idx) => idx !== i));
                }} className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full border border-stone-200 text-stone-900 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-110 transition-all z-10 shadow-sm">
                  <X size={14} />
                </button>
              </div>
            ))}
            {previewUrls.length < 7 && (
              <div onClick={() => fileInputRef.current.click()} className="aspect-square border-2 border-dashed border-stone-200 hover:border-stone-400 transition-all flex flex-col items-center justify-center gap-3 bg-stone-50 hover:bg-stone-100 group cursor-pointer rounded-xl overflow-hidden relative">
                <Plus className="text-stone-400 group-hover:text-stone-900 transition-all group-hover:rotate-90 group-hover:scale-110" size={28} />
                <span className="text-[9px] font-black text-stone-400 group-hover:text-stone-900 uppercase tracking-[0.3em]">Add Asset</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: CONFIGURATION */}
      <section className="w-full lg:w-[58%] h-[65vh] lg:h-full bg-[#f7f6f4] flex flex-col relative">
        <div className="px-6 lg:px-12 py-6 lg:py-12 flex justify-between items-end sticky top-0 bg-[#f7f6f4]/80 backdrop-blur-xl z-30 border-b border-stone-200">
          <button onClick={() => navigate(-1)} className="h-11 w-11 flex items-center justify-center bg-white hover:bg-stone-900 hover:text-white transition-all rounded-full border border-stone-200 shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Sparkles size={11} className="text-[#c8ff00] animate-pulse" />
              <span className="text-[9px] font-black text-stone-500 tracking-[0.5em] uppercase">Development</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-stone-900 to-stone-400">New Drop.</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 lg:px-12 pb-24 space-y-16 custom-scrollbar pt-8">

          <div className="space-y-14">
            {/* Title & Description */}
            <div className="space-y-10">
              <div className="group relative">
                <label className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors mb-3 block ${errors.title ? 'text-red-500' : 'text-stone-400 group-focus-within:text-stone-900'}`}>
                  {errors.title || 'Product Name'}
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-4 text-3xl font-black uppercase transition-all focus:outline-none placeholder:text-stone-300 tracking-tight text-stone-900"
                  placeholder="E.G. NOIR BOX TEE"
                />
              </div>

              <div className="group relative">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 transition-colors mb-3 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-4 text-sm font-medium focus:outline-none transition-all placeholder:text-stone-300 resize-none leading-relaxed tracking-wide text-stone-900"
                  placeholder="Fabric composition, fit, and aesthetic details..."
                />
              </div>
            </div>

            {/* SIZE & COLOR SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={12} className="text-stone-400 group-focus-within:text-stone-900" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Base Color</label>
                </div>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-4 text-xl font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-300 text-stone-900 transition-all"
                  placeholder="E.G. ONYX BLACK"
                />
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={12} className="text-stone-400 group-focus-within:text-stone-900" />
                  <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] block transition-colors">Standard Size</label>
                </div>
                <input
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-4 text-xl font-black uppercase focus:outline-none tracking-widest placeholder:text-stone-300 text-stone-900 transition-all"
                  placeholder="E.G. MEDIUM"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-3 block transition-colors">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-5 text-[11px] font-black tracking-[0.2em] uppercase focus:outline-none cursor-pointer text-stone-900 transition-all"
              >
                {["MEN", "WOMEN", "KID", "UNISEX"].map(c => (
                  <option key={c} value={c} className="bg-white text-stone-900">{c}</option>
                ))}
              </select>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="group">
                <label className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 block transition-colors ${errors.priceAmount ? 'text-red-500' : 'text-stone-400 group-focus-within:text-stone-900'}`}>
                  {errors.priceAmount || 'Valuation'}
                </label>
                <div className="flex items-center border-b-2 border-stone-200 group-focus-within:border-stone-900 transition-all">
                  <input
                    name="priceAmount"
                    type="number"
                    value={formData.priceAmount}
                    onChange={handleInputChange}
                    className="no-spinner w-full bg-transparent py-4 text-2xl font-black focus:outline-none tracking-tighter text-stone-900 placeholder:text-stone-300"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-3 block transition-colors">Currency</label>
                <select name="priceCurrency" value={formData.priceCurrency} onChange={handleInputChange} className="w-full bg-transparent border-b-2 border-stone-200 focus:border-stone-900 py-5 text-[11px] font-black tracking-[0.2em] uppercase focus:outline-none cursor-pointer text-stone-900 transition-all">
                  {["INR", "USD", "EUR"].map(c => <option key={c} value={c} className="bg-white text-stone-900">{c}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="text-[9px] text-stone-400 group-focus-within:text-stone-900 font-black uppercase tracking-[0.4em] mb-3 block transition-colors">Inventory</label>
                <div className="flex items-center border-b-2 border-stone-200 group-focus-within:border-stone-900 transition-all">
                  <input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="no-spinner w-full bg-transparent py-4 text-2xl font-black focus:outline-none text-stone-900 tracking-tighter placeholder:text-stone-300"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />

          <div className="pt-8">
            <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white py-8 font-black uppercase tracking-[0.8em] text-[12px] hover:bg-[#c8ff00] hover:text-stone-900 transition-all active:scale-[0.98] flex items-center justify-center gap-4 relative shadow-xl group overflow-hidden rounded-md">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSubmitting ? <Loader2 className="animate-spin text-current" /> : (
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