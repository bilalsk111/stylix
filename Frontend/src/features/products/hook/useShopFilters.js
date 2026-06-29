// hooks/useShopFilters.js
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios"; // Ya tera custom API instance

export const useShopFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState({ products: [], pagination: {} });
    const [isLoading, setIsLoading] = useState(true);

    // URL parameter ko update karne ka function
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key); // Agar value empty hai, URL se hata do
        }
        
        // Agar filter change ho raha hai, toh wapas Page 1 par bhej do
        if (key !== 'page') newParams.set('page', '1'); 
        
        setSearchParams(newParams);
    };

    useEffect(() => {
        const fetchFilteredData = async () => {
            setIsLoading(true);
            try {
                // URL params ko string mein convert karke backend ko bhej rahe hain
                const queryString = searchParams.toString();
                const response = await axios.get(`/api/products/shop?${queryString}`);
                
                if (response.data.success) {
                    setData({
                        products: response.data.products,
                        pagination: response.data.pagination
                    });
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilteredData();
    }, [searchParams]); // 🔥 THE MAGIC: Jab bhi URL change hoga, ye dubara API hit karega

    return { 
        searchParams, 
        updateFilter, 
        products: data.products, 
        pagination: data.pagination, 
        isLoading 
    };
};