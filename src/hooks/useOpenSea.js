// src/hooks/useOpenSea.js

import { useState, useEffect } from 'react';
import { getListedOpportunities } from '../services/opensea'; // Corrected import path

function useOpenSea() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      try {
        const opportunities = await getListedOpportunities();
        setNfts(opportunities);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to fetch opportunities.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return { nfts, loading, error };
}

export default useOpenSea;
