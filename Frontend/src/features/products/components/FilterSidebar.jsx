import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Check } from "lucide-react";
import { useShopFilters } from "../hook/useShopFilters";

const FilterSidebar = ({ closeSidebar }) => {
  const { searchParams, updateFilter, toggleArrayFilter, resetFilters } = useShopFilters();

  const [openSections, setOpenSections] = useState({
    department: true,
    subCategory: true,
    size: true,
    color: true,
    price: true,
    tags: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Dynamic values aligned with your MERN backend
  const departments = ["MEN", "WOMEN", "UNISEX", "KID"];
  const subCategories = ["HOODIES", "TEES", "SHIRTS", "PANTS", "JACKETS", "SWEATSHIRTS"];
  const sizes = ["S", "M", "L", "XL", "XXL", "OVERSIZED"];
  const colors = ["BLACK", "WHITE", "GREY", "BEIGE", "PURPLE", "NAVY", "OLIVE"];
  const trendingTags = ["POPULAR", "TRENDING", "WINTER", "LIMITED", "OVERSIZED"];

  const activeCategories = searchParams.get("category")?.split(",") || [];
  const activeSubCategories = searchParams.get("subCategory")?.split(",") || [];
  const activeSizes = searchParams.get("size")?.split(",") || [];
  const activeColors = searchParams.get("color")?.split(",") || [];
  const activeTags = searchParams.get("tags")?.split(",") || [];
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <aside className="w-full space-y-6 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">
          Refine Search
        </span>
        {hasActiveFilters && (
          <button
            onClick={() => {
              resetFilters();
              if (closeSidebar) closeSidebar();
            }}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-stone-900 transition-colors"
          >
            <RotateCcw size={10} /> Reset
          </button>
        )}
      </div>

      {/* 1. Department */}
      <div className="border-b border-stone-200/60 pb-5">
        <button
          onClick={() => toggleSection("department")}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-stone-900 mb-3"
        >
          Department {openSections.department ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {openSections.department && (
          <div className="space-y-2 pt-1">
            {departments.map((dept) => {
              const checked = activeCategories.includes(dept);
              return (
                <label
                  key={dept}
                  onClick={() => toggleArrayFilter("category", dept)}
                  className="flex items-center justify-between cursor-pointer group text-[11px] font-bold tracking-wider uppercase"
                >
                  <span className={checked ? "text-stone-900 font-black" : "text-stone-500 group-hover:text-stone-900"}>
                    {dept}
                  </span>
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${checked ? "bg-stone-900 border-stone-900 text-white" : "border-stone-300 group-hover:border-stone-900"}`}>
                    {checked && <Check size={8} strokeWidth={3} />}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SUB CATEGORIES (T-Shirts, Hoodies, etc.) */}
      <div className="border-b border-stone-200/60 pb-5">
        <button
          onClick={() => toggleSection("subCategory")}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-stone-900 mb-3"
        >
          Apparel Type {openSections.subCategory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {openSections.subCategory && (
          <div className="space-y-2 pt-1">
            {subCategories.map((sub) => {
              const checked = activeSubCategories.includes(sub);
              return (
                <label
                  key={sub}
                  onClick={() => toggleArrayFilter("subCategory", sub)}
                  className="flex items-center justify-between cursor-pointer group text-[10px] font-bold tracking-wider uppercase"
                >
                  <span className={checked ? "text-stone-900 font-black" : "text-stone-500 group-hover:text-stone-900"}>
                    {sub}
                  </span>
                  <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${checked ? "bg-stone-900 border-stone-900 text-white" : "border-stone-300 group-hover:border-stone-900"}`}>
                    {checked && <Check size={8} strokeWidth={3} />}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Size Filter */}
      <div className="border-b border-stone-200/60 pb-5">
        <button
          onClick={() => toggleSection("size")}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-stone-900 mb-3"
        >
          Size {openSections.size ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {openSections.size && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {sizes.map((s) => {
              const active = activeSizes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleArrayFilter("size", s)}
                  className={`py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                    active
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-900"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Color Filter */}
      <div className="border-b border-stone-200/60 pb-5">
        <button
          onClick={() => toggleSection("color")}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-stone-900 mb-3"
        >
          Color {openSections.color ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {openSections.color && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {colors.map((clr) => {
              const active = activeColors.includes(clr);
              return (
                <button
                  key={clr}
                  onClick={() => toggleArrayFilter("color", clr)}
                  className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${
                    active
                      ? "bg-[#ccff00] text-stone-900 border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-900"
                  }`}
                >
                  {clr}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Trending Tags */}
      <div>
        <button
          onClick={() => toggleSection("tags")}
          className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-stone-900 mb-3"
        >
          Collections & Tags {openSections.tags ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {openSections.tags && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trendingTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter("tags", tag)}
                  className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${
                    active
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-900"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
};

export default FilterSidebar;