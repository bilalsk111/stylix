import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  ChevronRight,
  ArrowUpRight,
  X,
  Ruler,
  Droplets,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Minus, // 🔥 ADDED MINUS
  Plus   // 🔥 ADDED PLUS
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import ProductGrid from "../components/ProductGrid";
import { useCart } from "../../cart/hook/useCart";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../auth/hook/useAuth";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleGetAllProduct } = useProduct();
  const { handleAddItem } = useCart();
  const EMPTY_CART = [];
  const { currentUser } = useAuth()
  const cartItems = useSelector((state) => state.cart?.items || EMPTY_CART);

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [localCart, setLocalCart] = useState([]);
  
  // 🔥 NAYI STATE: Quantity handle karne ke liye
  const [buyQty, setBuyQty] = useState(1);

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

  // 🔥 RESET QTY WHEN VARIANT CHANGES
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

  const availableStock = currentVariant?.stock || 0;
  const isOutOfStock = availableStock === 0;

  const showSuccessToast = () => {
    toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden rounded-2xl`}>
          <div className="flex p-4 gap-4 items-center">
            <div className="h-16 w-12 shrink-0 bg-stone-100 overflow-hidden rounded-lg">
              <img src={displayImages?.[0]?.url} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#a3cc00] mb-1">Added to Vault</p>
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
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden rounded-2xl`}>
          <div className="flex p-4 gap-3 items-start">
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-1">Selection Required</p>
              <p className="text-xs text-stone-600 font-medium">
                Please select <span className="text-stone-900 font-black uppercase">{missingOptions.join(" & ")}</span>
              </p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-stone-400 hover:text-stone-900 bg-stone-100 p-1.5 rounded-full">
              <X size={12} strokeWidth={3} />
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

      <style>{`
        @keyframes shrink-timeline {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{ duration: 5000 }}
        containerStyle={{
          top: '90px',
          right: '24px'
        }}
      />

      {/* BREADCRUMB */}
      <nav className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-6 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400 overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="hover:text-stone-900 cursor-pointer transition-colors bg-stone-200/50 px-3 py-1.5 rounded-full" onClick={() => navigate("/")}>
          Shop
        </span>
        <ChevronRight size={10} />
        <span className="hover:text-stone-900 cursor-pointer transition-colors bg-stone-200/50 px-3 py-1.5 rounded-full" onClick={() => navigate("/")}>
          {product.category || "Apparel"}
        </span>
        <ChevronRight size={10} />
        <span className="text-stone-900 truncate max-w-[200px] font-black bg-white shadow-sm px-3 py-1.5 rounded-full">
          {displayTitle}
        </span>
      </nav>

      <div className="max-w-[1450px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 px-6 lg:px-12 pb-24 items-start">

        {/* IMAGE SECTION (STICKY) */}
        <div className="lg:col-span-7 lg:sticky lg:top-32 relative flex flex-col-reverse md:flex-row gap-4">

          {/* THUMBNAILS SECTION */}
          <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[650px] no-scrollbar w-full md:w-20 pt-1 pb-4 md:py-1">
            {displayImages?.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-20 md:w-full md:aspect-[3/4] md:h-auto shrink-0 cursor-pointer overflow-hidden transition-all duration-300 rounded-xl bg-white shadow-sm border ${activeImg === i
                    ? "border-stone-900 ring-1 ring-stone-900 opacity-100 scale-100"
                    : "border-stone-200 opacity-60 hover:opacity-100 hover:scale-95"
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

          {/* Main Image */}
          <div className="w-full aspect-[3/4] md:aspect-[4/5] bg-white rounded-3xl relative overflow-hidden flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group cursor-crosshair border border-stone-100">
            <img
              src={displayImages?.[activeImg]?.url}
              className="w-full h-full object-cover object-top mix-blend-multiply transition-transform duration-[2s] ease-out group-hover:scale-105"
              alt={displayTitle}
            />
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-10">
                    <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-md shadow-lg">
                        Out of Stock
                    </span>
                </div>
            )}
            <div className="absolute flex gap-2 top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 border border-stone-200 shadow-sm rounded-full z-20">
              <ShieldCheck size={14} className="text-[#a3cc00]" />
              <span className="text-[8px] font-black tracking-[0.2em] uppercase text-stone-900 mt-0.5">
                Stylix Authentic
              </span>
            </div>
          </div>
        </div>

        {/* INFO SECTION (SCROLLABLE) */}
        <div className="lg:col-span-5 flex flex-col justify-start">

          {/* Title & Price */}
          <div className="mb-8">
            <div className="inline-block bg-stone-900 text-white text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full mb-4">
              New Drop
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[1] text-stone-900 mb-6 drop-shadow-sm">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-4 mb-6 bg-white w-fit px-6 py-3 rounded-2xl shadow-sm border border-stone-100">
              <span className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                {displayPrice?.currency} {displayPrice?.amount}
              </span>
              <span className="text-stone-400 line-through text-sm font-bold pt-1">
                {displayPrice?.currency} {Math.round(displayPrice?.amount * 1.5)}
              </span>
              <span className="bg-[#ccff00]/20 text-[#8cb300] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ml-2">
                -33% OFF
              </span>
            </div>

            <p className="text-stone-500 font-medium text-sm leading-relaxed bg-stone-100/50 p-4 rounded-2xl border border-stone-100">
              {product.description || "A curated essential crafted with premium materials. Precision cut for a relaxed, structural fit. Designed to elevate your daily rotation."}
            </p>
          </div>

          {/* Attributes Selection */}
          <div className="space-y-6 mb-8">
            {Object.entries(allPossibleOptions).map(([attrKey, attrValues]) => (
              <div key={attrKey} className="space-y-3">
                <div className="flex justify-between items-end">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900">
                    Select {attrKey}
                  </h3>
                  {attrKey.toLowerCase() === 'size' && (
                    <button className="text-[9px] text-stone-400 uppercase tracking-widest hover:text-stone-900 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm">
                      <Ruler size={10} /> Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 p-1 bg-white border border-stone-200 rounded-2xl shadow-inner w-fit">
                  {attrValues.map((val) => {
                    const isSelected = selectedAttributes[attrKey]?.toString().toLowerCase() === val.toLowerCase();
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeClick(attrKey, val)}
                        className={`px-6 py-2.5 min-w-[3.5rem] text-[11px] font-black uppercase tracking-wider transition-all duration-300 rounded-xl
                          ${isSelected
                            ? "bg-stone-900 text-white shadow-md transform scale-100"
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

          {/* 🔥 QUANTITY SELECTOR (NEW) */}
          <div className="mb-10">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4 w-fit bg-white border border-stone-200 p-1.5 rounded-xl shadow-sm">
                  <button
                      disabled={buyQty <= 1 || isOutOfStock}
                      onClick={() => setBuyQty(prev => prev - 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      <Minus size={16} strokeWidth={2.5} />
                  </button>
                  
                  <span className="w-8 text-center text-sm font-black text-stone-900">
                      {isOutOfStock ? 0 : buyQty}
                  </span>
                  
                  <button
                      disabled={buyQty >= availableStock || isOutOfStock}
                      onClick={() => setBuyQty(prev => prev + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      <Plus size={16} strokeWidth={2.5} />
                  </button>
              </div>

              {availableStock > 0 && availableStock <= 5 && (
                  <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mt-3 animate-pulse flex items-center gap-1">
                      <Zap size={12} /> Only {availableStock} left in stock
                  </p>
              )}
          </div>

          {/* Add to Cart / Buy Now Actions */}
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
                    // Standard implementation adds item with quantity
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
              className={`flex-1 bg-white border-2 border-stone-900 text-stone-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-sm
                ${isAdding || isOutOfStock ? "opacity-70 cursor-not-allowed" : "hover:bg-stone-900 hover:text-white hover:shadow-lg active:scale-95"}`}
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

                // 🔥 DYNAMIC QUANTITY PASSED HERE
                navigate("/checkout", {
                  state: {
                    buyNowItem: {
                      product: product,
                      variant: currentVariant,
                      quantity: buyQty // <-- Connected to the counter state!
                    }
                  }
                });
              }}
              className={`flex-1 text-stone-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 
                ${isOutOfStock 
                  ? "bg-stone-200 cursor-not-allowed text-stone-400" 
                  : "bg-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:bg-[#bbf000]"}`}
            >
              <Zap size={14} fill="currentColor" /> Buy It Now
            </button>
          </div>

          {/* Details & Care */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
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

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
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

          {/* Delivery Badges */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 p-5 bg-stone-100/50 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-3 text-stone-600 flex-1">
              <Truck size={18} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Express Delivery</span>
                <span className="text-[9px] font-medium text-stone-500">Dispatches in 24 hours</span>
              </div>
            </div>
            <div className="w-px h-8 bg-stone-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 text-stone-600 flex-1">
              <RefreshCcw size={18} strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Free Returns</span>
                <span className="text-[9px] font-medium text-stone-500">14-day return policy</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <section className="pt-16 pb-24 bg-white border-t border-stone-200">
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