import { useState, useEffect } from 'react';
import { OpenSeaService } from '@/services/api';

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

        const service = new OpenSeaService();
        const fetched = await service.getCollectionStats(collectionSlug);
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