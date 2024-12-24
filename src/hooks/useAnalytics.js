// hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import AlchemyService from '../services/api/alchemyService';

export const useAnalytics = (collectionAddress) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const alchemyService = new AlchemyService();
        
        const [transfers, buybacks] = await Promise.all([
          alchemyService.getTransferHistory(),
          alchemyService.analyzeUserBuybacks()
        ]);

        setData({
          transfers,
          buybacks
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (collectionAddress) {
      fetchAnalytics();
    }
  }, [collectionAddress]);

  return { loading, error, data };
};