import React, { useCallback } from 'react';
import { useShopFilters } from '../hooks/useShopFilters';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';

const Shop = () => {
    const { searchParams, updateFilter, products, pagination, isLoading } = useShopFilters();

    //Memoized pagination handlers to prevent function recreation on every render
    const handlePrevPage = useCallback(() => {
        if (pagination?.currentPage > 1) {
            updateFilter('page', pagination.currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // UX Improvement: Scroll to top on page change
        }
    }, [pagination?.currentPage, updateFilter]);

    const handleNextPage = useCallback(() => {
        if (pagination?.currentPage < pagination?.totalPages) {
            updateFilter('page', pagination.currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagination?.currentPage, pagination?.totalPages, updateFilter]);

    return (
        <div className="min-h-screen bg-[#f7f6f4] pt-[120px] pb-24 px-6 lg:px-12">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar */}
                <FilterSidebar 
                    searchParams={searchParams} 
                    updateFilter={updateFilter} 
                />

                {/* Render Area */}
                <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex grid blowout on smaller screens */}
                    <div className="mb-6 flex justify-between items-end border-b border-stone-200 pb-4">
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-stone-900 leading-none">
                            The Archive
                        </h1>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-none">
                            {pagination?.totalProducts || 0} Assets Found
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400 animate-pulse">
                            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
                            Decrypting Catalog...
                        </div>
                    ) : products?.length === 0 ? (
                        <div className="h-[50vh] flex flex-col items-center justify-center text-center bg-white border border-stone-200 shadow-sm p-8">
                            <span className="text-4xl mb-4">📭</span>
                            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-2">No Assets Found</h3>
                            <p className="text-[11px] font-medium text-stone-500 max-w-xs">
                                Try adjusting your filters or search criteria to discover more items.
                            </p>
                            <button 
                                onClick={() => window.location.href = '/shop'} 
                                className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] border-b border-stone-900 text-stone-900 pb-0.5 hover:text-stone-500 transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Product Grid */}
                            <ProductGrid products={products} />

                            {/* Pagination Controls */}
                            {pagination?.totalPages > 1 && (
                                <div className="mt-16 flex justify-center items-center gap-4">
                                    <button 
                                        disabled={pagination.currentPage === 1}
                                        onClick={handlePrevPage}
                                        className="px-6 py-3 bg-white border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-white disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Prev
                                    </button>
                                    
                                    <span className="px-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
                                        <span className="text-stone-900">{pagination.currentPage}</span> / {pagination.totalPages}
                                    </span>

                                    <button 
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={handleNextPage}
                                        className="px-6 py-3 bg-white border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-white disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Next
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