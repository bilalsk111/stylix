import React, { useMemo } from "react";
import ProductGrid from "./ProductGrid";
import { useRecentlyViewed } from "../hook/useRecentlyViewed"; // Apna path verify kar lena

export const RecentlyViewedProducts = ({ currentProductId, allProducts }) => {
  const { recentIds } = useRecentlyViewed(currentProductId);

  const recentProducts = useMemo(() => {
    if (!allProducts?.length || recentIds.length <= 1) return [];

    return allProducts
      .filter((p) => {
        const isRecent = recentIds.includes(String(p._id));
        const isNotCurrent = String(p._id) !== String(currentProductId);
        return isRecent && isNotCurrent;
      })
      // Jis order me history me hai, usi order me sort karo
      .sort((a, b) => recentIds.indexOf(String(a._id)) - recentIds.indexOf(String(b._id)));
  }, [allProducts, recentIds, currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <ProductGrid 
      products={recentProducts} 
      title="Recently Viewed" 
      limit={4} 
    />
  );
};