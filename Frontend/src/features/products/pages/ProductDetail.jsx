import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCcw,
  ArrowUpRight,
  X,
  Tag,
  Scissors
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import ProductGrid from "../components/ProductGrid";
import { useCart } from "../../cart/hook/useCart";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleGetAllProduct } = useProduct();
  const { handleAddItem } = useCart();

  const cartItems = useSelector((state) => state.cart?.items || []);

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [localCart, setLocalCart] = useState([]); 

  const getProductByIdRef = useRef(handleGetProductById);
  const getAllProductRef = useRef(handleGetAllProduct);

  useEffect(() => {
    getProductByIdRef.current = handleGetProductById;
    getAllProductRef.current = handleGetAllProduct;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductByIdRef.current(id);
        if (isMounted) {
          setProduct(data);
          if (data?.variants?.length > 0) {
            setCurrentVariant(data.variants[0]);
            setSelectedAttributes(data.variants[0].attributes);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const data = await getAllProductRef.current();
        if (isMounted) setAllProducts(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, []);

  const getStrId = (idObj) => {
    if (!idObj) return "";
    if (typeof idObj === "string") return idObj;
    if (typeof idObj === "object") {
      if (idObj.$oid) return idObj.$oid;
      if (idObj._id) return getStrId(idObj._id); 
    }
    return String(idObj);
  };

  const allPossibleOptions = useMemo(() => {
    if (!product?.variants) return {};
    const options = {};
    product.variants.forEach((v) => {
      if (!v.attributes) return;
      Object.entries(v.attributes).forEach(([key, value]) => {
        if (!options[key]) options[key] = new Set();
        options[key].add(value.toString().toUpperCase());
      });
    });
    Object.keys(options).forEach(
      (key) => (options[key] = Array.from(options[key])),
    );
    return options;
  }, [product]);

  const handleAttributeClick = (key, value) => {
    const targetValue = value.toLowerCase();
    
    let bestMatch = product.variants.find((v) => {
      if (v.attributes[key]?.toString().toLowerCase() !== targetValue) return false;
      let otherMatch = true;
      Object.entries(selectedAttributes).forEach(([selKey, selVal]) => {
        if (selKey !== key && v.attributes[selKey]?.toString().toLowerCase() !== selVal?.toString().toLowerCase()) {
          otherMatch = false;
        }
      });
      return otherMatch;
    });

    if (!bestMatch) {
      bestMatch = product.variants.find((v) =>
        v.attributes[key]?.toString().toLowerCase() === targetValue
      );
    }

    if (bestMatch) {
      setCurrentVariant(bestMatch);
      setSelectedAttributes(bestMatch.attributes);
      setActiveImg(0); 
    } else {
      setSelectedAttributes({ ...selectedAttributes, [key]: value });
    }
  };

  const isCurrentlyInCart = useMemo(() => {
    if (!product || !currentVariant) return false;
    const pId = getStrId(product._id);
    const vId = getStrId(currentVariant._id);

    if (localCart.includes(vId)) return true;

    if (!Array.isArray(cartItems)) return false;
    return cartItems.some(item => {
      const itemPId = getStrId(item.productId || item.product);
      const itemVId = getStrId(item.variantId || item.variant);
      return itemPId === pId && itemVId === vId;
    });
  }, [cartItems, product, currentVariant, localCart]);


  const displayImages = currentVariant?.images?.length > 0 && currentVariant.images[0]?.url 
    ? currentVariant.images 
    : product?.images;

  const displayPrice = currentVariant?.price || product?.price;
  
  const displayTitle = currentVariant?.title && currentVariant.title.toUpperCase() !== "DEFAULT" 
    ? currentVariant.title 
    : product?.title;

  // LIGHT THEME TOASTERS
  const showSuccessToast = () => {
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-stone-200 shadow-xl flex flex-col overflow-hidden rounded-xl`}>
          <div className="flex p-4 gap-4 items-center">
            <div className="h-16 w-12 shrink-0 bg-stone-100 border border-stone-200 rounded-md overflow-hidden">
              <img src={displayImages?.[0]?.url} className="w-full h-full object-cover" alt="Product" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">Added to Cart</p>
              <p className="text-[11px] font-bold italic text-stone-900 line-clamp-1 mb-2">{displayTitle}</p>
              <button 
                onClick={() => { toast.dismiss(t.id); navigate("/bag"); }} 
                className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-900 hover:text-stone-500 flex items-center gap-1 w-fit transition-colors"
              >
                Go to Cart <ArrowUpRight size={10} />
              </button>
            </div>

            <button onClick={() => toast.dismiss(t.id)} className="text-stone-400 hover:text-stone-900 self-start">
              <X size={14} />
            </button>
          </div>

          <div className="h-[2px] w-full bg-stone-100">
            <div className="h-full bg-[#ccff00]" style={{ animation: "shrink-timeline 5s linear forwards" }} />
          </div>
        </div>
      ),
      { duration: 2000, id: "cart-success" }
    );
  };

  const showErrorToast = (missingOptions) => {
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-stone-200 shadow-xl flex flex-col overflow-hidden rounded-xl`}>
          <div className="flex p-4 gap-3 items-start">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Action Required</p>
              <p className="text-[11px] text-stone-500 font-medium">
                Please select <span className="text-stone-900 font-bold">{missingOptions.join(" & ")}</span> before adding.
              </p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-stone-400 hover:text-stone-900">
              <X size={14} />
            </button>
          </div>
          
          <div className="h-[2px] w-full bg-stone-100">
            <div className="h-full bg-red-500" style={{ animation: "shrink-timeline 5s linear forwards" }} />
          </div>
        </div>
      ),
      { duration: 2000, id: "cart-error" }
    );
  };

  if (loading)
    return (
      <div className="h-screen bg-[#f7f6f4] flex items-center justify-center">
        <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
          Synchronizing Vault...
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen bg-[#f7f6f4] flex items-center justify-center text-stone-900 p-20 text-center uppercase tracking-widest text-xs font-black">
        Asset Missing
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 selection:bg-stone-900 selection:text-white pt-[100px] lg:pt-[130px]">
      
      <style>{`
        @keyframes shrink-timeline {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 5000 }} />

      <nav className="max-w-[1300px] mx-auto px-6 lg:px-8 mb-6 flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-stone-400 overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => navigate("/")}>
          Archive
        </span>
        <ChevronRight size={8} />
        <span className="text-stone-900 truncate max-w-[200px] italic">
          {displayTitle}
        </span>
      </nav>

      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 px-6 lg:px-8 pb-12">
        
        {/* IMAGE SECTION */}
        <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[400px] no-scrollbar w-full md:w-auto">
            {displayImages?.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-14 h-16 md:w-12 md:h-16 shrink-0 border cursor-pointer overflow-hidden transition-all duration-500 rounded-sm bg-stone-100 ${activeImg === i ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 opacity-60 hover:opacity-100"}`}
              >
                <img src={img.url} className="w-full h-full object-cover mix-blend-multiply" alt="" />
              </div>
            ))}
          </div>

          <div className="w-full max-w-[420px] mx-auto md:mx-0 max-h-[500px] aspect-[4/5] bg-stone-100 border border-stone-200 relative overflow-hidden flex-1 shadow-sm rounded-sm">
            <img
              src={displayImages?.[activeImg]?.url}
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-[2s] ease-out hover:scale-110"
              alt={displayTitle}
            />
            <div className="absolute flex gap-3 top-4 left-4 bg-white/90 backdrop-blur-xl px-3 py-1.5 border border-stone-200 shadow-sm rounded-sm">
              <ShieldCheck size={12} className="text-stone-900" />
              <span className="text-[7px] font-black tracking-[0.2em] uppercase italic text-stone-900">
                Stylix Asset
              </span>
            </div>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="lg:col-span-7 flex flex-col justify-start space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight text-stone-900">
              {displayTitle}
            </h1>
            <p className="text-stone-500 font-medium italic text-[12px] leading-relaxed max-w-sm">
              {product.description || "A curated essential crafted with premium materials. Precision cut for a relaxed, structural fit. Designed to elevate your daily rotation."}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl md:text-4xl font-black text-stone-900 italic uppercase tracking-tighter">
                {displayPrice?.currency} {displayPrice?.amount}
              </span>
              <span className="text-stone-400 line-through text-[10px] font-black uppercase tracking-[0.2em] italic">
                {displayPrice?.currency} {Math.round(displayPrice?.amount * 1.5)}
              </span>
            </div>
            <span className="text-[8px] text-stone-400 font-black uppercase tracking-[0.5em] mt-1">
              Registry / Drop 04
            </span>
          </div>

          <div className="space-y-6 pt-6 border-t border-stone-200">
            {Object.entries(allPossibleOptions).map(([attrKey, attrValues]) => (
              <div key={attrKey} className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500">
                  Select {attrKey}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attrValues.map((val) => {
                    const isSelected =
                      selectedAttributes[attrKey]?.toString().toLowerCase() === val.toLowerCase();
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeClick(attrKey, val)}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 rounded-sm shadow-sm
                          ${isSelected ? "bg-[#ccff00] text-stone-900 border-[#ccff00]" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* NEW CONTENT ADDED HERE FOR REALISM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 pb-2">
            <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-stone-900">
                <Scissors size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Composition & Care</span>
              </div>
              <ul className="text-[10px] text-stone-500 space-y-1 mt-2 tracking-wide">
                <li>• 100% Heavyweight Cotton</li>
                <li>• 280 GSM Structural Fabric</li>
                <li>• Machine wash cold, dry flat</li>
              </ul>
            </div>
            <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-stone-900">
                <Tag size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Fit & Sizing</span>
              </div>
              <ul className="text-[10px] text-stone-500 space-y-1 mt-2 tracking-wide">
                <li>• Signature oversized silhouette</li>
                <li>• Dropped shoulders</li>
                <li>• True to size for intended fit</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              disabled={isAdding}
              onClick={async () => {
                const requiredKeys = Object.keys(allPossibleOptions);
                const missingOptions = requiredKeys.filter(key => !selectedAttributes[key]);

                if (missingOptions.length > 0) {
                  showErrorToast(missingOptions);
                  return;
                }

                if (isCurrentlyInCart) {
                  navigate("/bag");
                } else {
                  try {
                    const safeProductId = getStrId(product._id);
                    const safeVariantId = getStrId(currentVariant?._id);

                    setIsAdding(true);
                    
                    await handleAddItem({
                      productId: safeProductId,
                      variantId: safeVariantId,
                    });

                    setLocalCart(prev => [...prev, safeVariantId]);
                    showSuccessToast();
                    
                  } catch(e) {
                    console.error("Add item failed", e);
                  } finally {
                    setIsAdding(false);
                  }
                }
              }}
              className={`flex-1 bg-stone-900 text-white rounded-md py-4 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 transition-all duration-300 shadow-md
                ${isAdding ? "opacity-50 cursor-wait" : "hover:bg-[#ccff00] hover:text-stone-900 active:scale-95"}`}
            >
              {isCurrentlyInCart ? (
                <>GO TO BAG <ArrowUpRight size={14} /></>
              ) : isAdding ? (
                <>ADDING... <RefreshCcw size={14} className="animate-spin" /></>
              ) : (
                <>ADD TO VAULT <ShoppingBag size={14} /></>
              )}
            </button>
            
            <button 
              onClick={() => {
                const requiredKeys = Object.keys(allPossibleOptions);
                const missingOptions = requiredKeys.filter(key => !selectedAttributes[key]);

                if (missingOptions.length > 0) {
                  showErrorToast(missingOptions);
                  return;
                }
              }}
              className="flex-1 bg-[#ccff00] text-stone-900 rounded-md py-4 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-md active:scale-95"
            >
              <Zap size={14} fill="currentColor" /> Direct Checkout
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center gap-3 group transition-all shadow-sm hover:shadow-md">
              <Truck size={16} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
              <div className="flex flex-col">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-900">Global</p>
                <p className="text-[7px] font-bold uppercase tracking-tighter text-stone-500">Priority Dispatch</p>
              </div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center gap-3 group transition-all shadow-sm hover:shadow-md">
              <RefreshCcw size={16} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
              <div className="flex flex-col">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-900">15 Day</p>
                <p className="text-[7px] font-bold uppercase tracking-tighter text-stone-500">Vault Exchange</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-stone-200 pt-12 pb-20 bg-white">
        <div className="max-w-[1300px] mx-auto">
          <ProductGrid
            products={allProducts.filter(
              (p) => getStrId(p._id) !== getStrId(product._id)
            )}
            title="Related Inventory"
            limit={4}
          />
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;