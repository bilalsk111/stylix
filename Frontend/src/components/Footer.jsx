// components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-200 pt-20 pb-10 px-6 lg:px-12 mt-auto">
      <div className="max-w-[1800px] mx-auto">
        
        {/* TOP SECTION: 4-Column Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col gap-6">
            <Link to="/shop" className="text-5xl font-black italic tracking-tighter uppercase text-stone-900 w-max hover:text-[#ccff00] transition-colors duration-300">
              Stylix.
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 leading-relaxed max-w-xs">
              A curated index of precision-cut garments. Designed for the modern era.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 mb-2">The Archive</h4>
            <Link to="/shop?category=Men" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Menswear</Link>
            <Link to="/shop?category=Women" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Womenswear</Link>
            <Link to="/shop?category=Kid" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Kids</Link>
            <Link to="/shop" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">All Assets</Link>
          </div>

          {/* Column 3: Client Services */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 mb-2">Client Services</h4>
            <Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Shipping & Returns</Link>
            <Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Track Order</Link>
            <Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">FAQ</Link>
            <Link to="#" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">Contact Us</Link>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 mb-2">Intel</h4>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Subscribe for early access to drops.</p>
            <div className="flex items-center border-b border-stone-300 focus-within:border-stone-900 transition-colors pb-2 mt-2 group">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent outline-none text-[11px] font-black uppercase tracking-widest placeholder-stone-300 text-stone-900" 
              />
              <button className="text-stone-400 group-focus-within:text-stone-900 hover:text-[#ccff00] transition-colors ml-2">
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Legal & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-stone-100 gap-6">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 text-center md:text-left">
            © {new Date().getFullYear()} Stylix Corp. All Rights Reserved.
          </div>
          
          {/*  ICONS HATA DIYE, TEXT LINKS LAGA DIYE  */}
          <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">
            <a href="#" className="hover:text-stone-900 transition-colors">Instagram</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Twitter</a>
          </div>

          <div className="flex gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-stone-400">
            <Link to="#" className="hover:text-stone-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-stone-900 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;