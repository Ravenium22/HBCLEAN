import { useState, useEffect } from 'react';
import api from '../lib/api';

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
      try {
        setLoading(true);
        setError(null);

        // Use api directly
        const fetched = await api.getCollectionStats(collectionSlug);
        setStats(fetched);
      } catch (err) {
        console.error('Stats error:', err);
        setError(err.message);
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