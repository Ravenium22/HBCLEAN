// src/hooks/useCollectionData.js
import { useState, useEffect } from 'react';
import AlchemyService from '../services/api/alchemyService';
import PriceService from '../services/api/priceService';

const useCollectionData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    metadata: null,
    sales: [],
    holders: {
      current: [],
      total: 0
    },
    dailyStats: [],
    metrics: {
      totalVolume: 0,
      averagePrice: 0,
      highestSale: 0,
      lowestSale: 0,
      ethPrice: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alchemyService = new AlchemyService();
        const priceService = new PriceService();

        console.log('Fetching blockchain data...');
        
        // First get ETH price
        const ethPrice = await priceService.getEthPrice();
        console.log('Current ETH Price:', ethPrice);

        // Fetch blockchain data
        const [sales, holders, dailyTransfers] = await Promise.all([
          alchemyService.getSalesHistory(),
          alchemyService.getHolders(),
          alchemyService.getDailyTransfers()
        ]);

        console.log('Sales data:', sales);
        console.log('Holders data:', holders);
        console.log('Daily transfers:', dailyTransfers);

        // Calculate metrics
        const validSales = sales.filter(sale => sale.price > 0);
        const metrics = {
          totalVolume: validSales.reduce((sum, sale) => sum + sale.price, 0),
          averagePrice: validSales.length > 0 
            ? validSales.reduce((sum, sale) => sum + sale.price, 0) / validSales.length 
            : 0,
          highestSale: validSales.length > 0 
            ? Math.max(...validSales.map(sale => sale.price))
            : 0,
          lowestSale: validSales.length > 0 
            ? Math.min(...validSales.map(sale => sale.price))
            : 0,
          ethPrice
        };

        console.log('Calculated metrics:', metrics);

        setData({
          sales: validSales,
          holders: {
            current: holders.owners,
            total: holders.totalCount
          },
          dailyStats: dailyTransfers,
          metrics
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in useCollectionData:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { loading, error, data };
};

export default useCollectionData;