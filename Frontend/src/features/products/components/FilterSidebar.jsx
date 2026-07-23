import React from 'react';
import { X } from 'lucide-react';

const FilterSidebar = ({ searchParams, updateFilter, closeSidebar }) => {
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'newest';

    const categories = ["Men", "Women", "Accessories", "Unisex"];
    const sortOptions = [
        { label: "Newest Drops", value: "newest" },
        { label: "Price: Low to High", value: "price_asc" },
        { label: "Price: High to Low", value: "price_desc" }
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h3 className="text-lg font-black uppercase tracking-widest text-stone-900">Filter Engine</h3>
                <button onClick={closeSidebar} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 hover:text-red-500 transition-colors">
                    <X size={16} strokeWidth={3} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10">
                
                {/* Category Section */}
                <div>
                    <h4 className="text-[10px] uppercase text-stone-400 font-bold tracking-[0.2em] mb-4">Category</h4>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => updateFilter('category', '')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-none border transition-all ${!currentCategory ? 'bg-stone-900 text-[#ccff00] border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                        >
                            All Assets
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => updateFilter('category', cat)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-none border transition-all ${currentCategory.toLowerCase() === cat.toLowerCase() ? 'bg-stone-900 text-[#ccff00] border-stone-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Section */}
                <div>
                    <h4 className="text-[10px] uppercase text-stone-400 font-bold tracking-[0.2em] mb-4">Sort Arsenal</h4>
                    <div className="flex flex-col gap-2">
                        {sortOptions.map(option => (
                            <button 
                                key={option.value}
                                onClick={() => updateFilter('sort', option.value)}
                                className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-none border transition-all ${currentSort === option.value ? 'bg-stone-50 text-stone-900 border-stone-300 shadow-sm' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Future Sections: Color, Size can go here using similar flex-wrap pill structures */}
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-stone-100">
                <button 
                    onClick={closeSidebar}
                    className="w-full bg-[#ccff00] text-stone-900 text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-none shadow-lg hover:bg-stone-900 hover:text-[#ccff00] transition-colors"
                >
                    Apply & View Results
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;