import React from "react";

export const SkeletonCard = ({ viewMode }) => (
  <div className={`animate-pulse ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-6 md:gap-8 border-b border-stone-200 pb-6' : 'flex flex-col gap-4'}`}>
    {/* Image placeholder shrunk further */}
    <div className={`bg-stone-200/50 ${viewMode === 'list' ? 'w-full md:w-40 lg:w-48 aspect-[3/4] shrink-0' : 'aspect-[3/4]'}`} />
    
    <div className={`flex flex-col px-1 ${viewMode === 'list' ? 'flex-1 py-2 justify-between' : 'space-y-3'}`}>
      <div>
        <div className="h-4 bg-stone-200/50 w-3/4 rounded mb-3" />
        <div className="h-4 bg-stone-200/50 w-1/3 rounded" />
        {viewMode === 'list' && (
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-stone-200/50 w-full rounded" />
            <div className="h-3 bg-stone-200/50 w-5/6 rounded" />
          </div>
        )}
      </div>
    </div>
  </div>
);