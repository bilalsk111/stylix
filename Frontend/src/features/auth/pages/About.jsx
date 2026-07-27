import React from "react";
import { ArrowDownRight, Target, ShieldCheck, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#f7f6f4] pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 border-b border-stone-200 pb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-8 bg-[#ccff00]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">
                The Origin Story
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-stone-900 leading-[0.9]">
              Engineered <br className="hidden md:block" />
              For The Streets. <br className="hidden md:block" />
              <span className="text-stone-400">Built To Last.</span>
            </h1>
          </div>

          <div className="max-w-sm">
            <p className="text-sm font-medium text-stone-500 leading-relaxed">
              Stylix isn't just about throwing fabric together. It's a calculated collision of modern aesthetics, premium materials, and raw underground culture. We don't follow trends; we archive them.
            </p>
          </div>
        </div>

        {/* HERO IMAGE SECTION */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-stone-900 mb-24 overflow-hidden border border-stone-800">
          {/* Background Image */}
          <img
            src="/banner.jpg"
            alt="Stylix Archive"
            className="w-full h-full object-cover object-top grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-1000"
          />

          {/* HTML Text Overlay - Left Side Container */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none">
            <div className="max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ccff00] mb-2 block">
                Official Lookbook 2026
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                Stylix <br />
                <span className="text-stone-400">Archive.</span>
              </h1>
              <p className="text-xs font-medium text-stone-300 max-w-sm hidden sm:block">
                Heavyweight construction. Engineered for the streets.
              </p>
            </div>
          </div>
        </div>

        {/* CORE VALUES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-24">

          {/* Value 1 */}
          <div className="flex flex-col">
            <div className="w-14 h-14 bg-stone-900 text-[#ccff00] flex items-center justify-center mb-6">
              <ShieldCheck size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-3">
              Uncompromising Quality
            </h3>
            <p className="text-xs font-medium text-stone-500 leading-relaxed">
              Every seam, stitch, and silhouette is stress-tested. We source heavy-weight cottons and industrial-grade hardware to ensure our assets survive the grind.
            </p>
          </div>

          {/* Value 2 */}
          <div className="flex flex-col">
            <div className="w-14 h-14 bg-stone-900 text-[#ccff00] flex items-center justify-center mb-6">
              <Zap size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-3">
              Limited Drops
            </h3>
            <p className="text-xs font-medium text-stone-500 leading-relaxed">
              Mass production is the enemy of exclusivity. Our catalogs are dropped in strict, limited batches. Once an item is sold out, it's pushed to the archives forever.
            </p>
          </div>

          {/* Value 3 */}
          <div className="flex flex-col">
            <div className="w-14 h-14 bg-stone-900 text-[#ccff00] flex items-center justify-center mb-6">
              <Target size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-3">
              Zero Compromise
            </h3>
            <p className="text-xs font-medium text-stone-500 leading-relaxed">
              We cut the middlemen, skip the traditional retail markups, and deliver high-end streetwear architecture straight to your doorstep. Pure logic, zero bullshit.
            </p>
          </div>

        </div>

        {/* FOUNDER / CLOSING SECTION */}
        <div className="bg-stone-900 text-white p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
              Reject the <br /> <span className="text-[#ccff00]">Ordinary.</span>
            </h3>
            <p className="text-sm font-medium text-stone-400 leading-relaxed mb-8">
              Stylix was born out of frustration with the current state of apparel. Too many brands prioritize logos over fabric. We are here to flip that narrative.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-stone-800 border overflow-hidden border-stone-700">
                <img className="w-full h-full object-cover object-center " src="/profile.jpg" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">The Architect</p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">Stylix Core Team</p>
              </div>
            </div>
          </div>

          <ArrowDownRight size={120} strokeWidth={1} className="text-stone-800 hidden md:block" />
        </div>

      </div>
    </div>
  );
};

export default About;