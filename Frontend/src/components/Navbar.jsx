import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  ArrowUpRight,
  X // Added X for closing mobile search
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hook/useAuth";
import { useSelector } from "react-redux";

const NAV_LINKS = [
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Kid", to: "/kid" },
  { label: "Archive", to: "/archive" },
  { label: "Drops", to: "/drops" },
];

const SUGGESTIONS = [
  { text: "Maroon Dresses For Women", count: "32.9K" },
  { text: "Marvel Merchandise", count: "243" },
  { text: "Marvel", count: "147" },
  { text: "Marvel Oversized T-Shirts", count: "108" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, handleLogout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // NEW STATE FOR MOBILE SEARCH TOGGLE
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Safe fallback for cartItems to prevent crashes
  const cartItems = useSelector((state) => state.cart?.items);
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
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
    setMobileSearchOpen(false); // Close search on route change too
  }, [location.pathname]);

  // Focus mobile input automatically when opened
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");
  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileSearchOpen ? "py-3 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-sm" : "py-6 bg-white"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-8 relative">
          
          {/* Logo */}
          <Link
            to="/"
            className="text-[22px] font-black italic tracking-tighter uppercase text-stone-900 flex-shrink-0 z-50"
          >
            Stylix.
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
                  isActive(to) ? "text-stone-900 border-b-2 border-stone-900 pb-1" : "text-stone-400 hover:text-stone-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Expanded Search Bar (Desktop Only) */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <div className="w-full flex items-center gap-3 border-b border-stone-200 pb-1.5 focus-within:border-stone-900 transition-all">
              <Search size={16} className="text-stone-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COLLECTION..."
                className="bg-transparent w-full text-[10px] tracking-[0.2em] uppercase outline-none text-stone-900 placeholder-stone-400"
              />
            </div>

            {/* Search Dropdown (Desktop) */}
            {isSearchFocused && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 w-full bg-white border border-stone-200 mt-2 py-2 shadow-xl rounded-md animate-in fade-in slide-in-from-top-1"
              >
                {SUGGESTIONS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold text-stone-500 group-hover:text-stone-900 tracking-wider uppercase transition-colors">
                      {item.text}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-stone-300 group-hover:text-stone-900 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-5 z-50">
            
            {/* MOBILE SEARCH ICON (Visible only on Mobile) */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileOpen(false); // Close drawer if open
              }}
              className="md:hidden relative p-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              {mobileSearchOpen ? <X size={20} strokeWidth={2.5} className="text-stone-900" /> : <Search size={20} strokeWidth={2.5} />}
            </button>

            {/* BAG ICON */}
            <button
              onClick={() => {
                setMobileOpen(false);
                setMobileSearchOpen(false);
                navigate("/bag");
              }}
              className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors group"
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
                  className="flex items-center group"
                >
                  <div className="h-9 w-9 rounded-full bg-[#ccff00] text-stone-900 flex items-center justify-center text-[12px] font-black ring-2 ring-transparent group-hover:ring-stone-200 transition-all">
                    {getInitials(currentUser.fullname)}
                  </div>
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-4 w-52 bg-white border border-stone-200 shadow-xl rounded-md overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                      <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest truncate">
                        {currentUser.fullname}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all uppercase tracking-widest"
                    >
                      <User size={12} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest border-t border-stone-100"
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] border border-stone-200 rounded-md px-6 py-2.5 text-stone-900 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all"
              >
                Login
              </button>
            )}

            {/* Mobile Toggle Hamburger */}
            <button
              onClick={() => {
                setMobileOpen(!mobileOpen);
                setMobileSearchOpen(false); // Close search if open
              }}
              className="lg:hidden flex flex-col gap-1.5 relative w-6 h-5 z-50 justify-center"
            >
              <span
                className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${
                  mobileOpen ? "rotate-45" : "-translate-y-2"
                }`}
              />
              <span
                className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-px w-6 bg-stone-900 transition-all duration-300 absolute ${
                  mobileOpen ? "-rotate-45" : "translate-y-2"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* MOBILE EXPANDABLE SEARCH BAR              */}
        {/* ========================================= */}
        <div 
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 shadow-lg transition-all duration-300 overflow-hidden ${
            mobileSearchOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-b-0"
          }`}
        >
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-stone-100 px-4 py-3 rounded-lg border border-stone-200 focus-within:border-stone-900 transition-colors">
              <Search size={16} className="text-stone-500 shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FOR ITEMS..."
                className="bg-transparent w-full text-[11px] font-bold tracking-[0.2em] uppercase outline-none text-stone-900 placeholder-stone-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-stone-400 hover:text-stone-900">
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* Mobile Suggestions */}
            {searchQuery.length > 0 ? (
              <div className="flex flex-col gap-1 pb-2">
                {SUGGESTIONS.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-2 active:bg-stone-50 rounded-md">
                    <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">{item.text}</span>
                    <ArrowUpRight size={14} className="text-stone-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pb-2 px-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">Trending</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md">Oversized</span>
                  <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md">Jackets</span>
                  <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md">Cargo</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* MOBILE MENU DRAWER (RESPONSIVE ADDITION)  */}
      {/* ========================================= */}
      <div
        className={`fixed inset-0 bg-[#f7f6f4] z-40 lg:hidden flex flex-col transition-all duration-500 ease-in-out ${
          mobileOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"
        }`}
        style={{ paddingTop: "100px" }}
      >
        <div className="flex flex-col px-8 py-4 h-full overflow-y-auto pb-20">
          
          {/* Mobile Links */}
          <div className="flex flex-col gap-8 mt-4">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-2xl font-black uppercase tracking-[0.2em] transition-colors ${
                  isActive(to) ? "text-stone-900" : "text-stone-400 hover:text-stone-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Authentication / Profile */}
          <div className="mt-auto pt-10">
            {currentUser ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 border border-stone-200 bg-white rounded-xl shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-[#ccff00] text-stone-900 flex items-center justify-center text-[14px] font-black">
                    {getInitials(currentUser.fullname)}
                  </div>
                  <p className="text-xs font-black text-stone-900 uppercase tracking-widest truncate">
                    {currentUser.fullname}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-stone-900 flex items-center gap-3 border-b border-stone-200"
                >
                  <User size={16} /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-red-600 flex items-center gap-3"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full text-[12px] font-black uppercase tracking-[0.3em] border border-stone-900 bg-stone-900 rounded-xl py-5 text-white hover:bg-transparent hover:text-stone-900 transition-all shadow-md"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </> 
  );
};

export default Navbar;