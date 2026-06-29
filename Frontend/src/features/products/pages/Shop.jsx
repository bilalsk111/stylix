// pages/Shop.jsx
import React from 'react';
import { useShopFilters } from '../hooks/useShopFilters';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid'; // Tera purana grid component

const Shop = () => {
    // 4th Layer connects with 1st & 2nd Layer
    const { searchParams, updateFilter, products, pagination, isLoading } = useShopFilters();

    return (
        <div className="min-h-screen bg-[#f7f6f4] pt-[120px] pb-24 px-6 lg:px-12">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8">
                
                {/* 3rd Layer: Sidebar */}
                <FilterSidebar 
                    searchParams={searchParams} 
                    updateFilter={updateFilter} 
                />

                {/* 4th Layer: Render Area */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-stone-900">
                            The Archive
                        </h1>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                            {pagination.totalProducts || 0} Assets Found
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-400 animate-pulse">
                            Decrypting Catalog...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-sm font-medium text-stone-500">
                            No assets match your exact criteria.
                        </div>
                    ) : (
                        <>
                            {/* Product Grid */}
                            <ProductGrid products={products} />

                            {/* Pagination Controls */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button 
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => updateFilter('page', pagination.currentPage - 1)}
                                        className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >
                                        PREV
                                    </button>
                                    
                                    <span className="px-4 py-2 text-xs font-black uppercase flex items-center">
                                        {pagination.currentPage} / {pagination.totalPages}
                                    </span>

                                    <button 
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => updateFilter('page', pagination.currentPage + 1)}
                                        className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >
                                        NEXT
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;