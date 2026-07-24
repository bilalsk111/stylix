import React, { useState, useEffect } from "react";
import { X, Loader2, Sparkles, ShieldCheck, Tag, Layers } from "lucide-react";
import { useProduct } from "../hook/useProduct";
import toast from "react-hot-toast";

const EditProductModal = ({ productId, isOpen, onClose, onSuccess }) => {
  const { handleGetProductById, handleUpdateProduct } = useProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MEN",
    subCategory: "",
    collectionName: "",
    tags: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product data on modal open
  useEffect(() => {
    if (isOpen && productId) {
      setIsLoading(true);
      handleGetProductById(productId)
        .then((data) => {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "MEN",
            subCategory: data.subCategory || "",
            collectionName: data.collectionName || "",
            tags: data.tags ? data.tags.join(", ") : "",
          });
        })
        .catch(() => {
          toast.error("Failed to load asset metadata");
          onClose();
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleUpdateProduct(productId, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        collectionName: formData.collectionName,
        tags: formData.tags,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex justify-end bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-xl bg-[#f7f6f4] h-full shadow-2xl border-l border-stone-200 flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-white border-b border-stone-200 flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-[#a3d100]" />
              <span className="text-[9px] font-black text-stone-400 tracking-[0.4em] uppercase">
                Protocol Override
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-stone-900">
              Edit Main Drop
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">
              Syncing Protocol Data...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
            
            {/* Title */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 mb-2 block transition-colors">
                Product Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-sm font-black uppercase focus:outline-none transition-all text-stone-900"
                placeholder="E.G. NOIR BOX TEE"
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 mb-2 block transition-colors">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-xs font-medium focus:outline-none transition-all text-stone-900 resize-none leading-relaxed"
                placeholder="Enter details..."
              />
            </div>

            {/* Department / Category */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 mb-2 block transition-colors">
                Department (Gender)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer text-stone-900"
              >
                {["MEN", "WOMEN", "KID", "UNISEX"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* SubCategory */}
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={12} className="text-stone-400 group-focus-within:text-stone-900" />
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 block transition-colors">
                  Sub Category
                </label>
              </div>
              <input
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-xs font-black uppercase tracking-widest focus:outline-none transition-all text-stone-900"
                placeholder="E.G. HOODIES, TEES"
              />
            </div>

            {/* Collection */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 mb-2 block transition-colors">
                Collection
              </label>
              <input
                name="collectionName"
                value={formData.collectionName}
                onChange={handleInputChange}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-xs font-black uppercase tracking-widest focus:outline-none transition-all text-stone-900"
                placeholder="E.G. ARCHIVE VOL 01"
              />
            </div>

            {/* Tags */}
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} className="text-stone-400 group-focus-within:text-stone-900" />
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 block transition-colors">
                  Tags (Comma Separated)
                </label>
              </div>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-white border border-stone-200 focus:border-stone-900 p-4 text-xs font-bold uppercase tracking-widest focus:outline-none transition-all text-stone-900"
                placeholder="E.G. WINTER, LIMITED, OVERSIZED"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 text-white py-5 font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#c8ff00] hover:text-stone-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin text-current" size={16} />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProductModal;