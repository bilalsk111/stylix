import { useState, useEffect } from 'react';

export const useRecentlyViewed = (currentProductId) => {
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    // Get existing history from local storage
    const storedHistory = JSON.parse(localStorage.getItem('stylix_recent_views')) || [];

    if (currentProductId) {
      const stringId = String(currentProductId);
      // Remove the current product if it's already in the list so we can move it to the front
      const filtered = storedHistory.filter(id => id !== stringId);
      
      // Put the new product at the beginning, limit history to 10 items
      const updatedHistory = [stringId, ...filtered].slice(0, 10);
      
      localStorage.setItem('stylix_recent_views', JSON.stringify(updatedHistory));
      setRecentIds(updatedHistory);
    } else {
      setRecentIds(storedHistory);
    }
  }, [currentProductId]);

  return { recentIds };
};