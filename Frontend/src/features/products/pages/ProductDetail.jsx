import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  X,
  Ruler,
  Droplets,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Minus,
  Plus, 
  Heart 
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import ProductGrid from "../components/ProductGrid";
import { useCart } from "../../cart/hook/useCart";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/hook/useAuth";
import { useWishlist } from "../../wishlist/hook/useWishList";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleGetAllProduct } = useProduct();
  const { handleToggleWishlist, isWishlisted } = useWishlist();
  const { handleAddItem } = useCart();
  const EMPTY_CART = [];
  const { currentUser } = useAuth();
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_CART);

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [localCart, setLocalCart] = useState([]);

  const [buyQty, setBuyQty] = useState(1);

  const getProductByIdRef = useRef(handleGetProductById);
  const getAllProductRef = useRef(handleGetAllProduct);
  
  const thumbnailRef = useRef(null);

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
          
          if (data?.variants?.length > 0) {
            const globalFallbackAttributes = {};
            
            data.variants.forEach((v) => {
              if (!v.attributes) return;
              Object.entries(v.attributes).forEach(([key, value]) => {
                const strVal = value ? value.toString().trim() : "";
                if (strVal && strVal.toUpperCase() !== "DEFAULT" && strVal.toUpperCase() !== "N/A") {
                  if (!globalFallbackAttributes[key]) {
                    globalFallbackAttributes[key] = strVal;
                  }
                }
              });
            });

            data.variants = data.variants.map((v) => {
              const patchedAttrs = { ...(v.attributes || {}) };
              Object.keys(globalFallbackAttributes).forEach((key) => {
                const currentVal = patchedAttrs[key] ? patchedAttrs[key].toString().trim() : "";
                if (!currentVal || currentVal.toUpperCase() === "DEFAULT" || currentVal.toUpperCase() === "N/A") {
                  patchedAttrs[key] = globalFallbackAttributes[key]; 
                }
              });
              return { ...v, attributes: patchedAttrs };
            });

            setProduct(data); 

            const initialAttrs = { ...globalFallbackAttributes };
            
            let bestVariant = data.variants[0];
            const exactMatch = data.variants.find(v => {
              let isMatch = true;
              Object.entries(initialAttrs).forEach(([k, val]) => {
                const vVal = v.attributes?.[k] ? v.attributes[k].toString().trim().toUpperCase() : "";
                if (vVal !== val.toUpperCase()) isMatch = false;
              });
              return isMatch;
            });

            setCurrentVariant(exactMatch || bestVariant);
            setSelectedAttributes(exactMatch ? exactMatch.attributes : initialAttrs);
          } else {
             setProduct(data);
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

  useEffect(() => {
    setBuyQty(1);
  }, [currentVariant]);

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
        const strVal = value ? value.toString().trim() : "";
        if (strVal !== "" && strVal.toUpperCase() !== "DEFAULT" && strVal.toUpperCase() !== "N/A") {
          if (!options[key]) options[key] = new Set();
          options[key].add(strVal.toUpperCase());
        }
      });
    });
    
    Object.keys(options).forEach(
      (key) => (options[key] = Array.from(options[key]))
    );

    Object.keys(options).forEach(key => {
      if (options[key].length === 0) delete options[key];
    });

    return options;
  }, [product]);

  const handleAttributeClick = (key, value) => {
    const targetValue = value.toLowerCase();

    let bestMatch = product.variants.find((v) => {
      const currentVal = v.attributes[key] ? v.attributes[key].toString().toLowerCase() : "";
      if (currentVal !== targetValue) return false;
      let otherMatch = true;
      Object.entries(selectedAttributes).forEach(([selKey, selVal]) => {
        if (selKey !== key) {
          const compVal = v.attributes[selKey] ? v.attributes[selKey].toString().toLowerCase() : "";
          if (compVal !== selVal?.toString().toLowerCase()) {
            otherMatch = false;
          }
        }
      });
      return otherMatch;
    });

    if (!bestMatch) {
      bestMatch = product.variants.find((v) => {
        const currentVal = v.attributes[key] ? v.attributes[key].toString().toLowerCase() : "";
        return currentVal === targetValue;
      });
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


  const displayTitle = currentVariant?.title && 
    currentVariant.title.trim() !== "" && 
    currentVariant.title.toUpperCase() !== "DEFAULT" && 
    !currentVariant.title.toUpperCase().includes("VARIANT") 
      ? currentVariant.title 
      : (product?.title || "Untitled Product");

  const displayImages = currentVariant?.images?.length > 0 && currentVariant.images[0]?.url
    ? currentVariant.images
    : (product?.images?.length > 0 ? product.images : [{ url: "https://via.placeholder.com/600x800" }]);

  const displayPrice = currentVariant?.price?.amount
    ? currentVariant.price
    : product?.price;

  const availableStock = (currentVariant?.stock !== undefined && currentVariant?.stock !== null)
    ? currentVariant.stock
    : (product?.stock || 0);
    
  const isOutOfStock = availableStock === 0;

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
    if (!displayImages?.length) return;
    setActiveImg((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrevImg = () => {
    if (!displayImages?.length) return;
    setActiveImg((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const showSuccessToast = () => {
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden rounded-none`}>
          <div className="flex p-4 gap-4 items-center">
            <div className="h-16 w-12 shrink-0 bg-stone-100 overflow-hidden rounded-none">
              <img src={displayImages?.[0]?.url} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#a3cc00] mb-1">Added to Bag</p>
              <p className="text-xs font-black uppercase tracking-tight text-stone-900 line-clamp-1 mb-2">{displayTitle}</p>
              <button
                onClick={() => { toast.dismiss(t.id); navigate("/bag"); }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-900 hover:text-stone-500 flex items-center gap-1 w-fit transition-colors"
              >
                View Bag <ArrowUpRight size={10} />
              </button>
            </div>

            <button onClick={() => toast.dismiss(t.id)} className="text-stone-400 hover:text-stone-900 self-start bg-stone-100 p-1.5 rounded-full">
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      ),
      { duration: 2500, id: "cart-success" }
    );
  };

  const showErrorToast = (missingOptions) => {
    toast.error(`Please select ${missingOptions.join(" & ")}`, { position: "bottom-center" });
  };

  if (loading)
    return (
      <div className="h-screen bg-[#f7f6f4] flex items-center justify-center">
        <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
          Loading Asset...
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen bg-[#f7f6f4] flex items-center justify-center text-stone-900 p-20 text-center uppercase tracking-widest text-xs font-black">
        Product Unavailable
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 selection:bg-[#ccff00] selection:text-stone-900 pt-[100px] lg:pt-[130px]">
      <nav className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-8 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400 overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => navigate("/shop")}>
          Shop
        </span>
        <ChevronRight size={10} />
        <span className="hover:text-stone-900 cursor-pointer transition-colors" onClick={() => navigate("/shop")}>
          {product.category || "Apparel"}
        </span>
        <ChevronRight size={10} />
        <span className="text-stone-900 truncate max-w-[200px] font-black">
          {displayTitle}
        </span>
      </nav>

      {/* Reduced pb-24 to pb-10 here to fix the vertical gap */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 px-6 lg:px-12 pb-10 items-start">
        
        <div className="lg:col-span-6 lg:sticky lg:top-32 relative flex flex-col-reverse md:flex-row gap-4 h-fit">
          
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
              {displayImages?.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-20 md:w-full md:aspect-[3/4] md:h-auto shrink-0 cursor-pointer overflow-hidden transition-all duration-300 rounded-none bg-stone-200/50 border ${
                    activeImg === i
                      ? "border-stone-900 ring-1 ring-stone-900 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover object-top mix-blend-multiply"
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

          <div className="w-full aspect-[3/4] md:aspect-[4/5] bg-[#ececec] md:bg-stone-200/40 rounded-none relative overflow-hidden flex-1 group">
            <img
              src={displayImages?.[activeImg]?.url}
              className="w-full h-full object-cover object-top mix-blend-multiply transition-transform duration-[0.5s] ease-out"
              alt={displayTitle}
            />

            {displayImages?.length > 1 && (
              <>
                {/* Added opacity-0 and group-hover:opacity-100 to toggle on hover */}
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

            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-10">
                <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-none shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
            
            <div className="absolute flex items-center justify-center gap-2 top-6 left-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full z-20 shadow-sm border border-stone-200/60 pointer-events-none hidden md:flex">
              <ShieldCheck size={14} className="text-[#a3cc00]" strokeWidth={2.5} />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase text-stone-900 mt-0.5">
                Stylix Authentic
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col justify-start pt-2">
          <div className="flex justify-between items-start gap-6 mb-8">
            <h1 className="flex-1 text-3xl md:text-5xl lg:text-[2.75rem] font-black uppercase tracking-tighter leading-[1.1] text-stone-900 break-words">
              {displayTitle}
            </h1>
            <button
              onClick={(e) => {
                e.preventDefault(); 
                handleToggleWishlist(e, getStrId(product._id)); 
              }}
              className="p-3.5 bg-white border border-stone-200 rounded-full shadow-sm hover:border-red-500 group transition-all shrink-0 z-10"
            >
              <Heart
                size={22}
                className={isWishlisted(getStrId(product._id)) ? "text-red-500 fill-red-500" : "text-stone-300 group-hover:text-red-500"}
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8 bg-white w-fit px-6 py-4 rounded-none border border-stone-100 shadow-sm">
            <span className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              {displayPrice?.currency || "INR"} {displayPrice?.amount || "0"}
            </span>
            <span className="text-stone-400 line-through text-xs font-bold pt-1">
              {displayPrice?.currency || "INR"} {Math.round((displayPrice?.amount || 0) * 1.5)}
            </span>
            <span className="bg-[#ccff00]/20 text-[#8cb300] text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-none ml-1">
              -33% OFF
            </span>
          </div>

          <p className="text-stone-500 font-medium text-sm leading-relaxed mb-10 max-w-xl">
            {product.description || "A curated essential crafted with premium materials. Precision cut for a relaxed, structural fit."}
          </p>

          <div className="space-y-8 mb-10">
            {Object.entries(allPossibleOptions).map(([attrKey, attrValues]) => (
              <div key={attrKey} className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900">
                    Select {attrKey}
                  </h3>
                  {attrKey.toLowerCase() === 'size' && (
                    <button className="text-[9px] text-stone-400 uppercase tracking-widest hover:text-stone-900 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-none border border-stone-200 shadow-sm transition-colors">
                      <Ruler size={12} /> Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-stone-200 rounded-none w-fit shadow-sm">
                  {attrValues.map((val) => {
                    const isSelected = selectedAttributes[attrKey] && 
                                       selectedAttributes[attrKey].toString().toLowerCase() === val.toLowerCase();
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeClick(attrKey, val)}
                        className={`px-6 py-2.5 min-w-[3.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-none
                          ${isSelected
                            ? "bg-stone-900 text-white shadow-md"
                            : "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900"}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-4">Quantity</h3>
            <div className="flex items-center gap-6 w-fit bg-white border border-stone-200 px-2 py-2 rounded-none shadow-sm">
              <button
                disabled={buyQty <= 1 || isOutOfStock}
                onClick={() => setBuyQty(prev => prev - 1)}
                className="w-10 h-8 flex items-center justify-center rounded-none text-stone-400 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50 transition-colors"
              >
                <Minus size={14} strokeWidth={3} />
              </button>

              <span className="w-4 text-center text-[13px] font-black text-stone-900">
                {isOutOfStock ? 0 : buyQty}
              </span>

              <button
                disabled={buyQty >= availableStock || isOutOfStock}
                onClick={() => setBuyQty(prev => prev + 1)}
                className="w-10 h-8 flex items-center justify-center rounded-none text-stone-400 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50 transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              disabled={isAdding || isOutOfStock}
              onClick={async () => {
                const requiredKeys = Object.keys(allPossibleOptions);
                const missingOptions = requiredKeys.filter(key => !selectedAttributes[key]);

                if (!currentUser) {
                  navigate("/login");
                  return;
                }

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
                    await handleAddItem({ productId: safeProductId, variantId: safeVariantId, quantity: buyQty });
                    setLocalCart(prev => [...prev, safeVariantId]);
                    showSuccessToast();
                  } catch (e) {
                    console.error("Add item failed", e);
                  } finally {
                    setIsAdding(false);
                  }
                }
              }}
              className={`flex-1 bg-white border-[1.5px] border-stone-900 text-stone-900 py-4 sm:py-5 rounded-none text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-sm
                ${isAdding || isOutOfStock ? "opacity-70 cursor-not-allowed" : "hover:bg-stone-50 active:scale-[0.98]"}`}
            >
              {isCurrentlyInCart ? "View In Bag" : isAdding ? "Adding..." : "Add to Bag"}
            </button>

            <button
              disabled={isOutOfStock}
              onClick={() => {
                const requiredKeys = Object.keys(allPossibleOptions);
                const missingOptions = requiredKeys.filter(key => !selectedAttributes[key]);

                if (!currentUser) { navigate("/login"); return; }
                if (missingOptions.length > 0) { showErrorToast(missingOptions); return; }

                navigate("/checkout", {
                  state: {
                    buyNowItem: {
                      product: product,
                      variant: currentVariant,
                      quantity: buyQty 
                    }
                  }
                });
              }}
              className={`flex-1 text-stone-900 py-4 sm:py-5 rounded-none text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98] 
                ${isOutOfStock
                  ? "bg-stone-200 cursor-not-allowed text-stone-400"
                  : "bg-[#ccff00] hover:bg-[#bbf000] shadow-sm"}`}
            >
              <Zap size={14} fill="currentColor" strokeWidth={0} /> Buy It Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-none border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3 text-stone-900">
                <div className="bg-stone-100 p-2 rounded-full"><Ruler size={14} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Fit Details</span>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-2 font-medium">
                <li>• Boxy / Oversized Fit</li>
                <li>• Dropped Shoulders</li>
                <li>• Size down for standard fit</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-none border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3 text-stone-900">
                <div className="bg-stone-100 p-2 rounded-full"><Droplets size={14} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Materials</span>
              </div>
              <ul className="text-[11px] text-stone-500 space-y-2 font-medium">
                <li>• 100% Premium Cotton</li>
                <li>• 280 GSM Heavyweight</li>
                <li>• Cold wash inside out</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced pt-16 to pt-10 and pb-24 to pb-16 here to fix the vertical gap */}
      <section className="pt-10 pb-16 bg-white border-t border-stone-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <ProductGrid
            products={allProducts.filter((p) => getStrId(p._id) !== getStrId(product._id))}
            title="Curated For You"
            limit={4}
          />
        </div>
      </section>
    </div>
  );
};
 
export default ProductDetail;