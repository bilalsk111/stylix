import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  ArrowUpRight,
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
  { text: "maroon Dresses For Women", count: "32.9K" },
  { text: "marvel Merchandise", count: "243" },
  { text: "marvel", count: "147" },
  { text: "marvel Oversized T-Shirts", count: "108" },
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

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

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

  // Prevent body scrolling when mobile menu is open
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");
  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3 bg-black/90 backdrop-blur-xl border-b border-white/5" : "py-6 bg-black"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="text-[22px] font-black italic tracking-tighter uppercase text-white flex-shrink-0 z-50"
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
                  isActive(to) ? "text-[#ccff00]" : "text-neutral-500 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Expanded Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <div className="w-full flex items-center gap-3 border-b border-white/10 pb-1.5 focus-within:border-[#ccff00] transition-all">
              <Search size={16} className="text-neutral-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COLLECTION..."
                className="bg-transparent w-full text-[10px] tracking-[0.2em] uppercase outline-none text-white placeholder-neutral-700"
              />
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 w-full bg-[#0d0d0d] border border-white/10 mt-2 py-2 shadow-2xl animate-in fade-in slide-in-from-top-1"
              >
                {SUGGESTIONS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#ccff00] tracking-wider uppercase">
                      {item.text}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-neutral-700 group-hover:text-[#ccff00]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Area (Profile/Login + Bag + Mobile Toggle) */}
          <div className="flex items-center gap-6 z-50">
            {/* BAG ICON */}
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/bag");
              }}
              className="relative p-2 text-neutral-400 hover:text-[#ccff00] transition-colors group"
            >
              <ShoppingBag size={20} strokeWidth={2.5} />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ccff00] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_10px_rgba(204,255,0,0.5)]">
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
                  <div className="h-9 w-9 rounded-full bg-[#ccff00] text-black flex items-center justify-center text-[12px] font-black ring-2 ring-transparent group-hover:ring-[#ccff00]/30 transition-all">
                    {getInitials(currentUser.fullname)}
                  </div>
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-4 w-52 bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                        {currentUser.fullname}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-neutral-400 hover:text-[#ccff00] hover:bg-white/[0.03] transition-all uppercase tracking-widest"
                    >
                      <User size={12} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold text-red-500 hover:bg-red-500/5 transition-all uppercase tracking-widest border-t border-white/5"
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] border border-white/15 px-6 py-2.5 text-white hover:border-[#ccff00] hover:text-[#ccff00] transition-all"
              >
                Login
              </button>
            )}

            {/* Mobile Toggle Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-1.5 relative w-6 h-5 z-50 justify-center"
            >
              <span
                className={`h-px w-6 bg-white transition-all duration-300 absolute ${
                  mobileOpen ? "rotate-45" : "-translate-y-2"
                }`}
              />
              <span
                className={`h-px w-6 bg-white transition-all duration-300 absolute ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-px w-6 bg-white transition-all duration-300 absolute ${
                  mobileOpen ? "-rotate-45" : "translate-y-2"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* MOBILE MENU DRAWER (RESPONSIVE ADDITION)  */}
        {/* ========================================= */}
        <div
          className={`fixed inset-0 bg-[#050505] z-40 lg:hidden flex flex-col transition-all duration-500 ease-in-out ${
            mobileOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"
          }`}
          style={{ paddingTop: "100px" }} // Starts below the navbar
        >
          <div className="flex flex-col px-8 py-4 h-full overflow-y-auto pb-20">
            {/* Mobile Search */}
            <div className="w-full flex items-center gap-4 border-b border-white/10 pb-3 mb-10 focus-within:border-[#ccff00] transition-all">
              <Search size={18} className="text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COLLECTION..."
                className="bg-transparent w-full text-[12px] font-bold tracking-[0.2em] uppercase outline-none text-white placeholder-neutral-700"
              />
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-8">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-2xl font-black uppercase tracking-[0.2em] transition-colors ${
                    isActive(to) ? "text-[#ccff00]" : "text-neutral-400 hover:text-white"
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
                  <div className="flex items-center gap-4 p-4 border border-white/10 bg-white/[0.02]">
                    <div className="h-10 w-10 rounded-full bg-[#ccff00] text-black flex items-center justify-center text-[14px] font-black">
                      {getInitials(currentUser.fullname)}
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-widest truncate">
                      {currentUser.fullname}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-white flex items-center gap-3 border-b border-white/5"
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-red-400 flex items-center gap-3"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-[12px] font-black uppercase tracking-[0.3em] border border-[#ccff00] bg-[#ccff00] py-5 text-black hover:bg-transparent hover:text-[#ccff00] transition-all"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;