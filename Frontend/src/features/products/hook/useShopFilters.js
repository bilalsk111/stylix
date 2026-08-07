import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getShopFilteredProducts } from "../services/product.api";

export function useShopFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });
  
  // alag states banayi - Ek first load ke liye, ek background filter ke liye
  const [isLoading, setIsLoading] = useState(true); 
  const [isFetching, setIsFetching] = useState(false);

  const queryString = searchParams.toString();

  const fetchFilteredProducts = useCallback(async () => {
    // Agar products already screen par hain, toh main loading band rakho, sirf fetching on karo
    setIsFetching(true);
    
    try {
      const query = queryString ? `?${queryString}` : "";
      const data = await getShopFilteredProducts(query);

      if (!data) return;

      if (data.success) {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error("Filter Fetch Error:", error);
      setProducts([]);
    } finally {
      setIsLoading(false); // Pehli baar ka loader band
      setIsFetching(false); // Background update loader band
    }
  }, [queryString]); 

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const updateFilter = useCallback((key, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      if (key !== "page") newParams.set("page", "1");
      return newParams;
    });
  }, [setSearchParams]);

  const toggleArrayFilter = useCallback((key, item) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      const existing = newParams.get(key) ? newParams.get(key).split(",") : [];

      const updated = existing.includes(item)
        ? existing.filter((i) => i !== item)
        : [...existing, item];

      if (updated.length > 0) {
        newParams.set(key, updated.join(","));
      } else {
        newParams.delete(key);
      }
      newParams.set("page", "1");
      return newParams;
    });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    searchParams,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
    products,
    pagination,
    isLoading, // Initial page load ke liye
    isFetching, // Filter pe click karne ke baad ke liye
  };
}