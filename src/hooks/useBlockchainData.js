// src/hooks/useBlockchainData.js
import { useState, useEffect } from 'react';
import AlchemyService from '../services/api/alchemyService';

const useBlockchainData = (contractAddress) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    transfers: [],
    holders: [],
    sales: [],
    metrics: {
      totalVolume: 0,
      averagePrice: 0,
      uniqueHolders: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alchemyService = new AlchemyService(import.meta.env.VITE_ALCHEMY_API_KEY);
        
        const [transfers, holderInfo, sales] = await Promise.all([
          alchemyService.getTransferHistory(),
          alchemyService.getHolderDistribution(),
          alchemyService.getSaleHistory()
        ]);

        // Process the data
        const metrics = processBlockchainData(transfers, holderInfo, sales);
        
        setData({
          transfers,
          holders: holderInfo.owners,
          sales,
          metrics
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (contractAddress) {
      fetchData();
    }
  }, [contractAddress]);

  return { loading, error, data };
};

// Helper function to process blockchain data
const processBlockchainData = (transfers, holderInfo, sales) => {
  // Calculate metrics from raw blockchain data
  const totalVolume = sales.transfers.reduce((acc, sale) => acc + parseFloat(sale.value), 0);
  const averagePrice = totalVolume / sales.transfers.length;
  const uniqueHolders = holderInfo.owners.length;

  return {
    totalVolume,
    averagePrice,
    uniqueHolders
  };
};

export default useBlockchainData;