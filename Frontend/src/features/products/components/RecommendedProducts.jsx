import React, { useMemo } from "react";
import ProductGrid from "../components/ProductGrid";

export const RecommendedProducts = ({ currentProduct, allProducts }) => {
  const recommended = useMemo(() => {
    if (!currentProduct || !allProducts?.length) return [];
    
    return allProducts.filter((p) => {
      const isSameCategory = p.category === currentProduct.category;
      const isNotCurrentProduct = String(p._id) !== String(currentProduct._id);
      return isSameCategory && isNotCurrentProduct;
    });
  }, [currentProduct, allProducts]);

  if (recommended.length === 0) return null;

  return (
    <ProductGrid 
      products={recommended} 
      title="Recommended For You" 
      limit={4} 
    />
  );
};