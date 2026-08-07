import React from 'react';

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f7f6f4] pt-[120px] px-6 lg:px-12 w-full animate-pulse">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10">
        {/* Left Side: Images Skeleton */}
        <div className="w-full lg:w-7/12 flex gap-4">
            <div className="hidden md:flex flex-col gap-3 w-20">
                <div className="w-full aspect-[3/4] bg-stone-200"></div>
                <div className="w-full aspect-[3/4] bg-stone-200"></div>
                <div className="w-full aspect-[3/4] bg-stone-200"></div>
            </div>
            <div className="flex-1 aspect-[3/4] bg-stone-200"></div>
        </div>
        
        {/* Right Side: Text Skeleton */}
        <div className="w-full lg:w-5/12 space-y-6 pt-5">
          <div className="flex gap-2">
            <div className="h-4 bg-stone-200 w-16"></div>
            <div className="h-4 bg-stone-200 w-16"></div>
          </div>
          <div className="h-12 bg-stone-200 w-3/4"></div>
          <div className="h-8 bg-stone-200 w-1/3"></div>
          <div className="h-24 bg-stone-200 w-full mt-8"></div>
          <div className="h-16 bg-stone-200 w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;