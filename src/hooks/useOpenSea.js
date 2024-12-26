// src/hooks/useOpenSea.js

import { useState, useEffect } from 'react';
import OpenSeaService from '../services/api/OpenSeaService'; // Adjust the path as necessary

const useOpenSea = (collectionSlug) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    floor_price: 0,
    volume: 0,
    sales: 0,
    num_owners: 0,
    average_price: 0,
    market_cap: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const openSeaService = new OpenSeaService(); // Instantiate the service
      try {
        setLoading(true);
        setError(null);
        console.log(`useOpenSea: Fetching stats for ${collectionSlug}`);
        const fetched = await openSeaService.getCollectionStats(collectionSlug);
        console.log('useOpenSea: Fetched stats:', fetched);
        setStats(fetched);
      } catch (err) {
        console.error('useOpenSea: Error:', err);
        setError(err.message || 'Failed to fetch collection statistics.');
      } finally {
        setLoading(false);
      }
    };

    if (collectionSlug) {
      fetchStats();
    }
  }, [collectionSlug]);

  return { loading, error, stats };
};

export default useOpenSea;
