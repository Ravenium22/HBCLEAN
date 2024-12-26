// src/hooks/useOverview.js

import { useState, useEffect } from 'react';
import { getCollectionStats, getPriceGap } from '../services/opensea';

const useOverview = (collectionSlug) => {
  const [stats, setStats] = useState({
    floor_price: 0,
    volume: 0,
    sales: 0,
    num_owners: 0,
    average_price: 0,
    market_cap: 0
  });
  const [priceGap, setPriceGap] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedStats = await getCollectionStats(collectionSlug);
        const fetchedPriceGap = await getPriceGap(collectionSlug);
        setStats(fetchedStats);
        setPriceGap(fetchedPriceGap);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError(err.message || 'Failed to fetch overview data.');
      } finally {
        setLoading(false);
      }
    };
    
    if (collectionSlug) {
      fetchOverviewData();
    }
  }, [collectionSlug]);
  
  return { loading, error, stats, priceGap };
};

export default useOverview;
