// src/services/api/duneService.js
class DuneService {
    constructor() {
      this.API_KEY = import.meta.env.VITE_DUNE_API_KEY;
      this.baseUrl = "https://api.dune.com/api/v1";
      this.queryIds = {
        avgPriceByDate: 4157304, // Replace with your actual query ID
        dailyVolume: 4157383, // Replace with your actual query ID
        uniqueHolders: 4158634, // Replace with your actual query ID
        holdingTimeDistribution: 4158612, // Replace with your actual query ID
        totalHoldings: 4355418, // Replace with your actual query ID
        buybackAnalysis: 4363227 // Replace with your actual query ID
      };
    }
  
    // Utility function for retries with exponential backoff and jitter
    async makeApiRequestWithRetry(apiFunction, maxRetries = 6) {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          return await apiFunction();
        } catch (error) {
          if (error.message.includes("429")) { // Check for rate limit error
            retries++;
            const backoffTime = (3 ** retries) * 2000 + Math.random() * 2000; // Aggressive backoff, starting with 2 seconds
            console.warn(`Dune API rate limit hit. Retrying in ${backoffTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            throw error;
          }
        }
      }
      throw new Error(`Dune API request failed after ${maxRetries} retries`);
    }
  
    async executeQuery(queryId, parameters = {}) {
      return this.makeApiRequestWithRetry(async () => {
        const url = `${this.baseUrl}/query/${queryId}/execute`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'x-dune-api-key': this.API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // You can add query parameters here if your query requires them
            // "parameters": parameters
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Dune API Error:", errorData);
          throw new Error(`Dune API execute query error: ${response.status}`);
        }
  
        const data = await response.json();
        return data.execution_id;
      });
    }
  
    async getExecutionStatus(executionId) {
      return this.makeApiRequestWithRetry(async () => {
        const url = `${this.baseUrl}/execution/${executionId}/status`;
        const response = await fetch(url, {
          headers: {
            'x-dune-api-key': this.API_KEY
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Dune API Error:", errorData);
          throw new Error(`Dune API get execution status error: ${response.status}`);
        }
  
        const data = await response.json();
        return data.state; // e.g., "QUERY_STATE_COMPLETED"
      });
    }
  
    async getExecutionResults(executionId) {
      return this.makeApiRequestWithRetry(async () => {
        const url = `${this.baseUrl}/execution/${executionId}/results`;
        const response = await fetch(url, {
          headers: {
            'x-dune-api-key': this.API_KEY
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Dune API Error:", errorData);
          if (response.status === 404) {
            throw new Error(`Dune query results not found (404 error). Execution ID: ${executionId}`);
          } else {
            throw new Error(`Dune API get execution results error: ${response.status}`);
          }
        }
  
        try {
          const data = await response.json();
          return data.result.rows;
        } catch (error) {
          console.error("Error parsing JSON:", error);
          throw new Error("Failed to parse JSON response from Dune API.");
        }
      });
    }
  
    async getLatestResult(queryId) {
      try {
        const executionId = await this.executeQuery(queryId);
  
        let status = await this.getExecutionStatus(executionId);
        while (status !== 'QUERY_STATE_COMPLETED' && status !== 'QUERY_STATE_FAILED') {
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
          status = await this.getExecutionStatus(executionId);
        }
  
        if (status === 'QUERY_STATE_FAILED') {
          throw new Error(`Dune query execution failed. Execution ID: ${executionId}`);
        }
  
        return await this.getExecutionResults(executionId);
      } catch (error) {
        console.error(`Error fetching results for query ${queryId}:`, error);
        throw error; // Re-throw to be handled by caller
      }
    }
  
    async getMarketMetrics() {
        const cacheKey = 'marketMetrics';
        const cachedData = localStorage.getItem(cacheKey);
    
        // Check if cached data exists and is not expired
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < 60 * 60 * 1000 &&
                data.volume24h !== 0 &&
                data.totalVolume !== 0) {
                console.log('Returning cached market metrics');
                return data;
            } else {
                console.log('Cached market metrics are invalid or expired. Fetching fresh data.');
            }
        }
    
        try {
            const [avgPriceData, volumeData] = await Promise.all([
                this.getLatestResult(this.queryIds.avgPriceByDate),
                this.getLatestResult(this.queryIds.dailyVolume)
            ]);
    
            console.log("Raw avgPrice data from Dune:", avgPriceData);
            console.log("Raw volume data from Dune:", volumeData);
    
            // Assuming the last element in the array is the latest
            const latestAvgPrice = avgPriceData[avgPriceData.length - 1] || {};
            const latestVolume = volumeData[volumeData.length - 1] || {};
    
            // Updated property names based on your screenshots
            const newData = {
                volume24h: Number((latestVolume.volume_usd || 0).toFixed(3)),
                totalVolume: Number((latestVolume.total_volume_usd || 0).toFixed(3)), // Assuming you have a total_volume_usd column in dailyVolume query
                averagePrice: Number((latestAvgPrice.avg_price_eth || 0).toFixed(3))
            };
    
            console.log("Processed market metrics data:", newData);
    
            // Cache the new data only if it's valid
            if (newData.volume24h !== 0 || newData.totalVolume !== 0 || newData.averagePrice !== 0) {
                localStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
                console.log('Market metrics fetched and cached');
            } else {
                console.warn('Market metrics data is invalid (all zeros). Not caching.');
            }
    
            return newData;
        } catch (error) {
            console.error('Error getting market metrics:', error);
    
            // Check for cached data even in case of an error
            if (cachedData) {
                const { data } = JSON.parse(cachedData);
                console.warn('Returning cached market metrics due to error');
                return data;
            }
    
            return {
                volume24h: 0,
                totalVolume: 0,
                averagePrice: 0
            };
        }
    }
    
    async getDailyVolume() {
        const cacheKey = 'dailyVolume';
        const cachedData = localStorage.getItem(cacheKey);
    
        if (cachedData) {
            try {
                const { data, timestamp } = JSON.parse(cachedData);
                // Check if cached data is valid AND not expired
                if (Date.now() - timestamp < 15 * 60 * 1000 && data.length > 0 && data.some(day => day.volume !== 0)) {
                    console.log('Returning cached daily volume');
                    return data;
                } else {
                    console.log('Cached daily volume data is invalid or expired. Fetching fresh data.');
                }
            } catch (error) {
                console.error('Error parsing cached daily volume data:', error);
                localStorage.removeItem(cacheKey); // Remove potentially corrupted cache data
                console.log('Cleared invalid cache for daily volume');
            }
        }
    
        try {
            const volumeData = await this.getLatestResult(this.queryIds.dailyVolume);
            console.log("Raw volume data from Dune:", volumeData);
    
            // Map the volume data, converting dates and handling missing data
            const mappedVolumeData = volumeData
                .filter(day => day.date && day.volume_usd) // Filter out incomplete entries
                .map(day => ({
                    date: day.date.substring(0, 10),
                    volume: Number(day.volume_usd)
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
    
            console.log("Processed daily volume data:", mappedVolumeData);
    
            // Cache the new data only if it's valid
            if (mappedVolumeData.length > 0 && mappedVolumeData.some(day => day.volume !== 0)) {
                localStorage.setItem(cacheKey, JSON.stringify({ data: mappedVolumeData, timestamp: Date.now() }));
                console.log('Daily volume fetched and cached');
            } else {
                console.warn('Daily volume data is invalid (empty or all zeros). Not caching.');
            }
    
            return mappedVolumeData;
        } catch (error) {
            console.error('Error getting daily volume:', error);
    
            // Check for valid cached data even in case of an error
            if (cachedData) {
                const { data } = JSON.parse(cachedData);
                if (data.length > 0 && data.some(day => day.volume !== 0)) {
                    console.warn('Returning cached daily volume due to error');
                    return data;
                }
            }
    
            return [];
        }
    }
      
    async getHolderMetrics() {
        const cacheKey = 'holderMetrics';
        const cachedData = localStorage.getItem(cacheKey);
    
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
    
          // Check if cached data is valid AND not expired
          if (Date.now() - timestamp < 6 * 60 * 60 * 1000 &&
            data.uniqueHolders !== 0) {
            console.log('Returning cached holder metrics');
            return data;
          } else {
            console.log('Cached holder metrics are invalid or expired. Fetching fresh data.');
          }
        }
    
        try {
          const holders = await this.getLatestResult(this.queryIds.uniqueHolders);
    
          console.log("Raw holder metrics data from Dune:", holders);
    
          const newData = { uniqueHolders: holders[0]?.total_unique_holders || 0 };
    
          console.log("Processed holder metrics data:", newData);
    
          // Cache the new data only if it's valid
          if (newData.uniqueHolders !== 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
            console.log('Holder metrics fetched and cached');
          } else {
            console.warn('Holder metrics data is invalid (zero). Not caching.');
          }
    
          return newData;
        } catch (error) {
          console.error('Error getting holder metrics:', error);
    
          // Check for cached data even in case of an error
          if (cachedData) {
            const { data } = JSON.parse(cachedData);
            console.warn('Returning cached holder metrics due to error');
            return data;
          }
    
          return { uniqueHolders: 0 };
        }
    }
      
    async getHoldingDistribution() {
        const cacheKey = 'holdingDistribution';
        const cachedData = localStorage.getItem(cacheKey);
    
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
    
            // Check if cached data is valid AND not expired
            if (Date.now() - timestamp < 3 * 60 * 60 * 1000 &&
                Object.values(data).some(val => val !== 0)) {
                console.log('Returning cached holding distribution');
                return data;
            } else {
                console.log('Cached holding distribution data is invalid or expired. Fetching fresh data.');
            }
        }
    
        try {
            const distribution = await this.getLatestResult(this.queryIds.holdingTimeDistribution);
            console.log("Raw holding distribution data from Dune:", distribution);
    
            const defaultDistribution = {
                '0-30d': 0,
                '30-90d': 0,
                '90-180d': 0,
                '180d+': 0
            };
    
            if (!distribution || distribution.length === 0) {
                console.warn("Holding distribution data is empty. Using default values.");
                return defaultDistribution;
            }
    
            // Improved findPercentage function
            const findPercentage = (category) => {
                const item = distribution.find(item => item.holding_category === category);
                if (item && typeof item.percentage === 'number') {
                    return Number(item.percentage.toFixed(1));
                }
                return 0; // Return 0 if not found or not a number
            };
    
            const newData = {
                '0-30d': findPercentage('Sold this week'),
                '30-90d': findPercentage('Held for < 1 month'),
                '90-180d': findPercentage('Held for 1-3 months'),
                '180d+': findPercentage('Held for 3-6 months')
            };
    
            console.log("Processed holding distribution data:", newData);
    
            // Cache the new data only if it's valid
            if (Object.values(newData).some(val => val !== 0)) {
                localStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
                console.log('Holding distribution fetched and cached');
            } else {
                console.warn('Holding distribution data is invalid (all zeros). Not caching.');
            }
    
            return newData;
        } catch (error) {
            console.error('Error getting holding distribution:', error);
    
            // Check for cached data even in case of an error
            if (cachedData) {
                const { data } = JSON.parse(cachedData);
                console.warn('Returning cached holding distribution due to error');
                return data;
            }
    
            return {
                '0-30d': 0,
                '30-90d': 0,
                '90-180d': 0,
                '180d+': 0
            };
        }
    }
  }
  
  export default DuneService;