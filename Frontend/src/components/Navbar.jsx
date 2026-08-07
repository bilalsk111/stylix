import React, { useState, useEffect, useRef } from "react";
import { ShoppingBag, User, LogOut, LayoutDashboard, Heart, ChevronDown } from "lucide-react"; 
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hook/useAuth";
import { useSelector, useDispatch } from "react-redux";
import { useCart } from "../features/cart/hook/useCart";
import { useWishlist } from "../features/wishlist/hook/useWishlist"; 

const NAV_LINKS = [
  { label: "Men", to: "/shop?category=Men" },
  { label: "Women", to: "/shop?category=Women" },
  { label: "Kid", to: "/shop?category=Kid" },
  { label: "About", to: "/about" }
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser, handleLogout } = useAuth();
  const { handleGetCart } = useCart();
  const { handleGetWishlist } = useWishlist(); 

  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const avatarRef = useRef(null);

  const cartItems = useSelector((state) => state.cart?.items);
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    if (currentUser) {
      handleGetCart();
      handleGetWishlist();
    }
  }, [currentUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  //  SMART ACTIVE LOGIC: URLParams based checking instead of dumb string matching
  const isActive = (to) => {
    if (to.includes("?")) {
      const [path, searchStr] = to.split("?");
      const toParams = new URLSearchParams(searchStr);
      const currentParams = new URLSearchParams(location.search);
      
      return location.pathname === path && currentParams.get("category") === toParams.get("category");
    }
    return location.pathname === to;
  };

  const handleCartClick = () => {
    if (!currentUser) navigate("/login");
    else navigate("/bag");
  };

  const executeLogout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-sm" : "py-6 bg-white"}`}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-8 relative">

          <Link
            to="/shop"
            className="text-[22px] font-black italic tracking-tighter uppercase text-stone-900 flex-shrink-0 z-50"
            title="View All Assets"
          >
            Stylix.
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isActive(to)
                    ? "text-stone-900 border-b-2 border-stone-900 pb-1"
                    : "text-stone-400 hover:text-stone-900"
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-6 z-50 ml-auto">

            {/* BAG ICON */}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleCartClick();
              }}
              className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors group"
              title="View Bag"
            >
              <ShoppingBag size={20} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ccff00] text-stone-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-sm border border-stone-900/10">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Login Desktop */}
            {currentUser ? (
              <div className="relative hidden md:block" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#ccff00] text-stone-900 flex items-center justify-center text-[12px] font-black ring-2 ring-transparent group-hover:ring-stone-200 transition-all">
                    {getInitials(currentUser.fullname)}
                  </div>
                  <ChevronDown size={14} className={`text-stone-400 group-hover:text-stone-900 transition-transform duration-300 ${avatarOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Avatar Dropdown */}
                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-4 w-52 bg-white border border-stone-200 shadow-xl rounded-none overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                      <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest truncate">
                        {currentUser.fullname}
                      </p>
                    </div>

                    <Link
                      to="/wishlist"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-[9px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all uppercase tracking-widest border-b border-stone-100"
                    >
                      <div className="flex items-center gap-3">
                        <Heart size={12} /> Wishlist
                      </div>
                      {wishlistCount > 0 && (
                        <span className="text-[9px] font-black text-stone-900 bg-stone-200 px-1.5 py-0.5 rounded-none">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {(currentUser.role === "seller" || currentUser.role === "admin") && (
                      <Link
                        to="/seller/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all uppercase tracking-widest border-b border-stone-100"
                      >
                        <LayoutDashboard size={12} /> Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all uppercase tracking-widest"
                    >
                      <User size={12} /> Profile
                    </Link>

                    {/* LOGOUT BUTTON */}
                    <button
                      onClick={() => { setAvatarOpen(false); setShowLogoutModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest border-t border-stone-100"
                    >
                      <LogOut size={12} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] border border-stone-200 rounded-none px-6 py-2.5 text-stone-900 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
              >
                Login
              </button>
            )}

            {/* Mobile Toggle Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-1.5 relative w-6 h-5 z-50 justify-center"
            >
              <span className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${mobileOpen ? "rotate-45" : "-translate-y-2"}`} />
              <span className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${mobileOpen ? "-rotate-45" : "translate-y-2"}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed inset-0 bg-[#f7f6f4] z-40 lg:hidden flex flex-col transition-all duration-500 ease-in-out ${mobileOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"}`}
        style={{ paddingTop: "100px" }}
      >
        <div className="flex flex-col px-8 py-4 h-full overflow-y-auto pb-20">
          <div className="flex flex-col gap-8 mt-4">
            <Link
              to="/shop"
              className={`text-2xl font-black uppercase tracking-[0.2em] transition-colors ${isActive("/shop") && !location.search ? "text-stone-900" : "text-stone-400 hover:text-stone-900"}`}
            >
              Shop All
            </Link>

            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-2xl font-black uppercase tracking-[0.2em] transition-colors ${isActive(to) ? "text-stone-900" : "text-stone-400 hover:text-stone-900"}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10">
            {currentUser ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 border border-stone-200 bg-white rounded-none shadow-sm mb-2">
                  <div className="h-10 w-10 rounded-full bg-[#ccff00] text-stone-900 flex items-center justify-center text-[14px] font-black">
                    {getInitials(currentUser.fullname)}
                  </div>
                  <p className="text-xs font-black text-stone-900 uppercase tracking-widest truncate">
                    {currentUser.fullname}
                  </p>
                </div>

                <button
                  onClick={() => { setMobileOpen(false); navigate("/wishlist"); }}
                  className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-stone-900 flex items-center justify-between border-b border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} /> Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] font-black text-stone-900 bg-stone-200 px-2 py-1 rounded-none">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {(currentUser.role === "seller" || currentUser.role === "admin") && (
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/seller/dashboard"); }}
                    className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-stone-900 flex items-center gap-3 border-b border-stone-200"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                )}

                <button
                  onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                  className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-stone-900 flex items-center gap-3 border-b border-stone-200"
                >
                  <User size={16} /> My Profile
                </button>

                <button
                  onClick={() => { setMobileOpen(false); setShowLogoutModal(true); }}
                  className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-red-600 flex items-center gap-3"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="w-full text-[12px] font-black uppercase tracking-[0.3em] border border-stone-900 bg-stone-900 rounded-none py-5 text-white hover:bg-transparent hover:text-stone-900 transition-all shadow-md"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-none max-w-sm w-full p-6 shadow-2xl space-y-5 animate-fade-in-up">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-900">Confirm Logout</h3>
              <p className="text-[10px] text-stone-500 italic mt-1">Are you sure you want to exit?</p>
            </div>
            <div className="border-t border-stone-100" />
            <div className="flex justify-end gap-3">
              <button disabled={isLoggingOut} onClick={() => setShowLogoutModal(false)} className="px-4 py-2.5 text-[9px] font-black uppercase border border-stone-200 rounded-none text-stone-500 hover:bg-stone-50">
                Cancel
              </button>
              <button disabled={isLoggingOut} onClick={executeLogout} className="px-4 py-2.5 text-[9px] font-black uppercase bg-stone-900 text-white rounded-none hover:bg-red-500 flex items-center gap-2">
                {isLoggingOut ? <span className="w-3 h-3 border-2 border-t-white rounded-full animate-spin" /> : <LogOut size={12} />}
                {isLoggingOut ? "Logging Out..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;