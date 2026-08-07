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
  Heart,
  Store 
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import ProductGrid from "../components/ProductGrid";
import { useCart } from "../../cart/hook/useCart";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/hook/useAuth";
import { useWishlist } from "../../wishlist/hook/useWishList";
import { Accordion } from "../components/Accordion"; 
import { RecommendedProducts } from "../components/RecommendedProducts";
import { RecentlyViewedProducts } from "../components/RecentlyViewedProducts";
import { getShopFilteredProducts } from "../services/product.api"; 
import ProductDetailSkeleton from "../components/ProductDetailSkeleton";

// Stable constants and Memory Cache to achieve 0ms load on revisit
const EMPTY_CART = [];
const PRODUCT_CACHE = {}; 

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById } = useProduct(); 
  const { handleToggleWishlist, isWishlisted } = useWishlist();
  const { handleAddItem } = useCart();
  const { currentUser } = useAuth();
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_CART);
  const [product, setProduct] = useState(() => PRODUCT_CACHE[id] || null);
  const [loading, setLoading] = useState(() => !PRODUCT_CACHE[id]);
  
  const [activeImg, setActiveImg] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [localCart, setLocalCart] = useState([]);
  const [buyQty, setBuyQty] = useState(1);

  const thumbnailRef = useRef(null);

  // 1. Fetch Main Product Details
  useEffect(() => {
    let isMounted = true;
    
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        // Sirf tabhi loading screen dikhao jab cache mein data nahi hai
        if (!PRODUCT_CACHE[id]) {
          setLoading(true);
        }

        const data = await handleGetProductById(id);
        
        if (isMounted && data) {
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

            // Save to memory cache for 0ms load next time
            PRODUCT_CACHE[id] = data;
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
             PRODUCT_CACHE[id] = data;
             setProduct(data);
          }
        }
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id, handleGetProductById]);

  // 2. Fetch Recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        const categoryQuery = product?.category ? `category=${product.category}&` : '';
        const query = `?${categoryQuery}limit=8`; 
        
        const data = await getShopFilteredProducts(query);
        if (isMounted) {
            setAllProducts(data?.products || []);
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      }
    };

    if (product) {
        fetchRecommendations();
    }
    return () => { isMounted = false; };
  }, [product]);

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
    
  const isOutOfStock = availableStock <= 0;

  const sellerName = 
    product?.seller?.storeName || 
    product?.seller?.fullname || 
    product?.seller?.name || 
    product?.user?.fullname || 
    product?.createdBy?.fullname || 
    product?.brand || 
    "Independent Seller";

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

  if (loading) return <ProductDetailSkeleton />;

  if (!product)
    return (
      <div className="h-screen bg-[#f7f6f4] flex items-center justify-center text-stone-900 p-20 text-center uppercase tracking-widest text-xs font-black">
        Product Unavailable
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 selection:bg-[#ccff00] selection:text-stone-900 pt-[100px] lg:pt-[120px]">
      
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400 overflow-x-auto no-scrollbar whitespace-nowrap">
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

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 px-6 lg:px-12 pb-16 items-start">
        
        <div className="lg:col-span-7 lg:sticky lg:top-[120px] self-start relative flex flex-col-reverse md:flex-row gap-4 w-full h-fit">
          
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
                <button
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
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleScrollThumbnails('down')} 
              className="hidden md:flex items-center justify-center bg-white p-2 rounded-full shadow-sm hover:shadow-md border border-stone-200 text-stone-900 hover:bg-stone-50 transition-all z-10"
            >
              <ChevronDown size={16} strokeWidth={2.5}/>
            </button>
          </div>

          <div className={`flex-1 w-full aspect-[3/4] xl:aspect-[4/5] bg-stone-100/60 rounded-none relative overflow-hidden group ${isOutOfStock ? 'grayscale opacity-90' : ''}`}>
            <img
              src={displayImages?.[activeImg]?.url}
              className="w-full h-full object-cover object-top mix-blend-multiply transition-transform duration-[0.6s] ease-out group-hover:scale-[1.03]"
              alt={displayTitle}
            />

            {displayImages?.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevImg(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-md border border-stone-200 text-stone-900 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105"
                >
                  <ChevronLeft size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextImg(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-md border border-stone-200 text-stone-900 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105"
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
            
            <div className="absolute flex items-center justify-center gap-2 top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full z-20 shadow-sm border border-stone-200/60 pointer-events-none hidden md:flex">
              <ShieldCheck size={14} className="text-[#a3cc00]" strokeWidth={2.5} />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase text-stone-900 mt-0.5 truncate max-w-[150px]">
                {sellerName} Authentic
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-start pt-0 md:pr-4">
          
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
              {product?.brand || "Stylix"}
            </span>
            <span className="w-1 h-1 bg-stone-300 rounded-full shrink-0"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 shrink-0">
              {product?.subCategory || product?.category || "Archive"}
            </span>
            
            {(product?.isNew || product?.tags?.includes('new') || product?.tags?.includes('NEW')) && (
              <>
                <span className="w-1 h-1 bg-stone-300 rounded-full ml-1 shrink-0"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-900 bg-[#ccff00] px-2 py-0.5 ml-1 shrink-0">
                  New Arrival
                </span>
              </>
            )}
          </div>

          <div className="flex justify-between items-start gap-6 mb-3">
            <h1 className="flex-1 text-3xl md:text-4xl lg:text-[2.5rem] font-black uppercase tracking-tighter leading-[1.1] text-stone-900 break-words">
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

          <div className="flex items-center gap-2 mb-6 text-[10px] md:text-[11px]">
            <span className="font-bold text-stone-400 uppercase tracking-[0.1em]">Sold by:</span>
            <div className="font-black text-stone-900 uppercase tracking-[0.15em] flex items-center gap-1.5 cursor-pointer group">
              <Store size={13} className="text-stone-400 group-hover:text-stone-900 transition-colors" /> 
              <span className="border-b border-stone-900/30 group-hover:border-stone-900 pb-[1px] transition-colors">
                {sellerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 bg-white w-fit px-6 py-4 rounded-none border border-stone-100 shadow-sm">
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

          <p className="text-stone-500 font-medium text-sm leading-relaxed mb-8">
            {product.description || "A curated essential crafted with premium materials. Precision cut for a relaxed, structural fit."}
          </p>

          <div className="space-y-8 mb-8">
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

          <div className="mb-8">
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

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
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

          <div className="grid grid-cols-3 gap-2 py-6 border-t border-stone-200 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck size={20} strokeWidth={1.25} className="text-stone-400" />
              <p className="text-[10px] uppercase tracking-tight text-stone-500">Free Shipping</p>
            </div>
            <div className="flex flex-col items-center gap-2 border-l border-stone-200">
              <RefreshCcw size={20} strokeWidth={1.25} className="text-stone-400" />
              <p className="text-[10px] uppercase tracking-tight text-stone-500">14-Day Returns</p>
            </div>
            <div className="flex flex-col items-center gap-2 border-l border-stone-200">
              <ShieldCheck size={20} strokeWidth={1.25} className="text-stone-400" />
              <p className="text-[10px] uppercase tracking-tight text-stone-500">Secure Checkout</p>
            </div>
          </div>

          <div className="mt-2 flex-1">
            <Accordion
              items={[
                {
                  title: 'Materials & Care',
                  body: (
                    <ul className="space-y-2">
                      <li>• 100% Premium Heavyweight Cotton</li>
                      <li>• 280 GSM Density for structural integrity</li>
                      <li>• Machine wash cold, inside out</li>
                      <li>• Do not iron directly on print</li>
                    </ul>
                  )
                },
                {
                  title: 'Delivery Information',
                  body: (
                    <>
                      <p className="mb-2">All orders are processed and dispatched within 24-48 hours from our fulfillment center.</p>
                      <ul className="space-y-2">
                        <li>• Standard Shipping: 3-5 Business Days (Free)</li>
                        <li>• Express Priority: 1-2 Business Days (Calculated at checkout)</li>
                      </ul>
                    </>
                  )
                },
                {
                  title: 'Return Policy',
                  body: 'Unworn items with original tags attached can be returned within 14 days of delivery for a full refund or exchange. Final sale items are not eligible for returns.'
                }
              ]}
            />
          </div>

        </div>
      </div>

      <section className="pt-10 pb-16 bg-white border-t border-stone-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-20">
          
          <RecommendedProducts 
            currentProduct={product} 
            allProducts={allProducts} 
          />

          <RecentlyViewedProducts 
            currentProductId={product?._id} 
            allProducts={allProducts} 
          />

        </div>
      </section>
    </div>
  );
};

export default ProductDetail;