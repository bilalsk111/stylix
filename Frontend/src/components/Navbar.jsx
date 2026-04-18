import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, X, ChevronDown, User, Package, Heart, LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hook/useAuth";

const NAV_LINKS = [
  { label: "Archive", to: "/archive" },
  { label: "Drops",   to: "/drops"   },
  { label: "About",   to: "/about"   },
];

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser, handleLogout } = useAuth();

  const [scrolled,      setScrolled]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  const searchRef = useRef(null);
  const avatarRef = useRef(null);

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* focus search on open */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  /* close avatar dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* ── Main bar ── */}
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "py-3 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
            : "py-5 bg-transparent",
        ].join(" ")}
      >
        <div className="max-w-[1800px] mx-auto px-5 lg:px-10 flex items-center justify-between gap-8">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="text-[18px] font-black italic tracking-tighter uppercase leading-none
                       text-white hover:text-[#ccff00] transition-colors duration-300 flex-shrink-0"
          >
            Stylix.
          </Link>

          {/* ── Center links (desktop) ── */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={[
                  "relative text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-200 group",
                  isActive(to) ? "text-[#ccff00]" : "text-neutral-400 hover:text-white",
                ].join(" ")}
              >
                {label}
                {/* active underline */}
                <span
                  className={[
                    "absolute -bottom-1 left-0 h-px bg-[#ccff00] transition-all duration-300",
                    isActive(to) ? "w-full" : "w-0 group-hover:w-full",
                  ].join(" ")}
                />
              </Link>
            ))}
          </div>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-4 flex-shrink-0">

            {/* Search */}
            <div className="flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pieces…"
                    className="bg-transparent border-b border-white/25 text-[10px] tracking-widest uppercase
                               outline-none text-white placeholder-white/25 w-36 pb-1
                               focus:border-[#ccff00] transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="text-neutral-600 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="text-neutral-500 hover:text-[#ccff00] transition-colors duration-200"
                >
                  <Search size={16} />
                </button>
              )}
            </div>

            {/* Bag */}
            <button
              onClick={() => navigate("/bag")}
              aria-label="Shopping bag"
              className="relative text-neutral-500 hover:text-[#ccff00] transition-colors duration-200"
            >
              <ShoppingBag size={16} />
              {/* bag item count badge — wire to your cart state */}
              {/* {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#ccff00] text-black
                                 text-[7px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )} */}
            </button>

            {/* Divider */}
            <span className="hidden md:block h-4 w-px bg-white/10" />

            {/* Auth zone */}
            {currentUser ? (
              /* Avatar + dropdown */
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-1.5 group"
                  aria-label="Account menu"
                >
                  <span
                    className={[
                      "h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black",
                      "bg-[#ccff00] text-black transition-transform duration-200",
                      avatarOpen ? "scale-110" : "group-hover:scale-110",
                    ].join(" ")}
                  >
                    {getInitials(currentUser.fullname)}
                  </span>
                  <ChevronDown
                    size={11}
                    className={[
                      "text-neutral-600 transition-transform duration-200 hidden md:block",
                      avatarOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={[
                    "absolute right-0 top-full mt-3 w-52 bg-[#0d0d0d] border border-white/8",
                    "transition-all duration-200 origin-top-right",
                    avatarOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
                  ].join(" ")}
                >
                  {/* User info header */}
                  <div className="px-4 py-3.5 border-b border-white/8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white truncate">
                      {currentUser.fullname ?? "Account"}
                    </p>
                    <p className="text-[9px] text-neutral-600 truncate mt-0.5">
                      {currentUser.email ?? ""}
                    </p>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: User,    label: "Profile",   to: "/profile"   },
                    { icon: Package, label: "My Orders", to: "/orders"    },
                    { icon: Heart,   label: "Wishlist",  to: "/wishlist"  },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase
                                 tracking-widest text-neutral-400 hover:text-[#ccff00] hover:bg-white/[0.03]
                                 transition-colors border-b border-white/[0.04] last:border-b-0"
                    >
                      <Icon size={12} />
                      {label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <button
                    onClick={() => { handleLogout?.(); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase
                               tracking-widest text-neutral-600 hover:text-red-400 hover:bg-white/[0.03]
                               transition-colors border-t border-white/8"
                  >
                    <LogOut size={12} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Login CTA */
              <button
                onClick={() => navigate("/login")}
                className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em]
                           border border-white/15 px-4 py-2 text-white/60
                           hover:border-[#ccff00]/60 hover:text-[#ccff00] transition-all duration-200"
              >
                Login
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden flex flex-col gap-[5px] p-1"
            >
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      <div
        className={[
          "fixed inset-0 z-40 bg-[#050505] flex flex-col pt-24 px-6 pb-10 transition-all duration-500 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 mt-4">
          {NAV_LINKS.map(({ label, to }, i) => (
            <Link
              key={to}
              to={to}
              className={[
                "text-[clamp(2rem,8vw,3.5rem)] font-black italic uppercase tracking-tighter leading-tight",
                "transition-all duration-200 border-b border-white/5 py-3",
                isActive(to) ? "text-[#ccff00]" : "text-white/30 hover:text-white",
              ].join(" ")}
              style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          {currentUser ? (
            <button
              onClick={() => { navigate("/profile"); setMobileOpen(false); }}
              className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-neutral-400"
            >
              <span className="h-8 w-8 rounded-full bg-[#ccff00] text-black flex items-center justify-center text-[11px] font-black">
                {getInitials(currentUser.fullname)}
              </span>
              {currentUser.fullname ?? "Account"}
            </button>
          ) : (
            <button
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="text-[9px] font-black uppercase tracking-[0.3em] border border-white/15 px-5 py-2.5 text-white/60 hover:border-[#ccff00]/60 hover:text-[#ccff00] transition-all"
            >
              Login
            </button>
          )}
          <button
            onClick={() => { navigate("/bag"); setMobileOpen(false); }}
            className="text-neutral-500 hover:text-[#ccff00] transition-colors"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;