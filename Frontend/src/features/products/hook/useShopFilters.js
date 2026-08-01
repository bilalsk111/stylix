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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data whenever URL query parameters change
  const fetchFilteredProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const data = await getShopFilteredProducts(queryString);

      // If data is null, it means the API request was aborted manually.
      // Return immediately. DO NOT set isLoading(false) because the next request is already running.
      if (!data) return;

      if (data.success) {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      }
      
      // Request complete, stop loading
      setIsLoading(false);
    } catch (error) {
      console.error("Filter Fetch Error:", error);
      setProducts([]);
      setIsLoading(false); // Stop loading on actual errors
    }
  }, [searchParams]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  // Helper function to update single or multiple query parameters
  const updateFilter = useCallback((key, value) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);

      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }

      // Filter change hone par initial page (1) pe reset kar do
      if (key !== "page") {
        newParams.set("page", "1");
      }

      return newParams;
    });
  }, [setSearchParams]);

  // Helper function multi-select toggles (e.g., categories, colors, sizes)
  const toggleArrayFilter = useCallback((key, item) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      const existing = newParams.get(key) ? newParams.get(key).split(",") : [];

      let updated;
      if (existing.includes(item)) {
        updated = existing.filter((i) => i !== item);
      } else {
        updated = [...existing, item];
      }

      if (updated.length > 0) {
        newParams.set(key, updated.join(","));
      } else {
        newParams.delete(key);
      }

      newParams.set("page", "1");
      return newParams;
    });
  }, [setSearchParams]);

  // Clear all filters
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
    isLoading,
  };
}