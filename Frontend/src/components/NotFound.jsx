import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f6f4] flex items-center justify-center p-6 text-stone-900 relative overflow-hidden select-none">
      
      {/* 🟢 BACKGROUND NOISE GRID PATTERN */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1c1917 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-2xl w-full flex flex-col items-center text-center z-10">
        
        {/* 🛠️ CUSTOM ANIMATED RADAR SVG */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8 flex items-center justify-center">
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full text-stone-900"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Static Crosshairs */}
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" className="opacity-20" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="1" className="opacity-20" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" className="opacity-20" />

            {/* 💥 ANIMATED NEON PULSE RING */}
            <circle 
              cx="100" 
              cy="100" 
              r="75" 
              stroke="#ccff00" 
              strokeWidth="2" 
              className="animate-ping origin-center opacity-75"
            />

            {/* ROTATING RADAR SCANNER */}
            <g className="animate-[spin_4s_linear_infinite] origin-center">
              <path 
                d="M100 100 L180 100 A80 80 0 0 0 100 20 Z" 
                fill="url(#radar-sweep)" 
                className="opacity-40"
              />
              <line x1="100" y1="100" x2="180" y2="100" stroke="#ccff00" strokeWidth="2" />
            </g>

            {/* CENTER ERROR ICON & GLITCH DOT */}
            <circle cx="100" cy="100" r="8" fill="#1c1917" />
            <circle cx="100" cy="100" r="4" fill="#ccff00" className="animate-pulse" />

            {/* SVG Gradients */}
            <defs>
              <radialGradient id="radar-sweep" cx="50%" cy="50%" r="50%" fx="100%" fy="50%">
                <stop offset="0%" stopColor="#ccff00" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Floating 404 Glitch Badge */}
          <div className="absolute bottom-2 right-4 bg-stone-900 text-[#ccff00] text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 shadow-md border border-stone-800">
            ERR_404_NULL
          </div>
        </div>

        {/* 📝 HEADINGS & TEXT */}
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-3 block">
          Asset Not Found // Dead End
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-stone-900 mb-4 leading-none">
          Out of <span className="text-stone-400">Bounds.</span>
        </h1>

        <p className="text-xs font-medium text-stone-500 max-w-md mb-8 leading-relaxed">
          The archive route you requested has been moved, renamed, or expunged from the Stylix system logs.
        </p>

        {/* 🛠️ ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-stone-200 text-stone-900 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft size={14} /> Go Back
          </button>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <ShoppingBag size={14} /> Explore Drops
          </Link>
        </div>

        {/* FOOTER SYSTEM CODE */}
        <div className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">
          Stylix Core Engine v2.0
        </div>

      </div>
    </div>
  );
};

export default NotFound;