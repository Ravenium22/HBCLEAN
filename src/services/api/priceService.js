// src/services/api/priceService.js
class PriceService {
    async getEthPrice() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        return data.ethereum.usd;
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        throw error;
      }
    }
  }
  
  export default PriceService;