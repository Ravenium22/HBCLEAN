// src/services/openseaService.js

import nftData from '../../data/nft-data.json';

class OpenSeaService {
  constructor() {
    this.baseUrl = 'https://api.opensea.io/api/v2'; // Ensure full URL
    this.headers = {
      'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
      'Accept': 'application/json'
    };
    this.contractAddress = '0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca';
    this.chain = 'arbitrum';
    this.localNFTData = nftData.nfts;
  }

  async getCollectionStats(collectionSlug = 'hungrybera') {
    try {
      const url = `${this.baseUrl}/collections/${collectionSlug}/stats`;
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) throw new Error(`Stats error: ${response.status} ${response.statusText}`);
      
      const data = await response.json();

      // Log the raw API response
      console.log('getCollectionStats API Response:', JSON.stringify(data, null, 2));

      // Parse the statistics from the response
      const parsedStats = {
        floor_price: Number(data?.total?.floor_price) || 0,
        volume: Number(data?.total?.volume) || 0,
        sales: Number(data?.total?.sales) || 0,
        num_owners: Number(data?.total?.num_owners) || 0,
        average_price: Number(data?.total?.average_price) || 0,
        market_cap: Number(data?.total?.market_cap) || 0
      };

      // Log the parsed statistics
      console.log('Parsed Stats:', parsedStats);

      return parsedStats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        floor_price: 0,
        volume: 0,
        sales: 0,
        num_owners: 0,
        average_price: 0,
        market_cap: 0
      };
    }
  }

  getRarityPrice(rank, floor_price, volume) {
    // Define a base multiplier
    const baseMultiplier = 1.5; // Start at 1.5x floor

    // Exponential decay based on rank
    const rankMultiplier = Math.pow(0.99, rank);

    // Calculate expected price
    const expectedPrice = floor_price * baseMultiplier * (1 + rankMultiplier);

    return expectedPrice;
  }

  async getCollectionListings() {
    try {
      let allListings = [];
      let next = null;
      
      do {
        const url = `${this.baseUrl}/listings/collection/hungrybera/all?limit=50${next ? `&next=${next}` : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.headers
        });

        if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        allListings = [...allListings, ...(data?.listings || [])];
        next = data?.next;

        console.log(`Fetched ${data.listings.length} listings, next cursor: ${next}`);

        // Introduce a delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } while (next);
      
      return allListings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  parsePrice(listing) {
    try {
      const priceStr = listing.price?.current?.value;
      return priceStr ? parseFloat(priceStr) / 1e18 : null; // Convert wei to ETH
    } catch (error) {
      console.error('Error parsing price:', error);
      return null;
    }
  }

  async getListedOpportunities() {
    try {
      const [listings, stats] = await Promise.all([
        this.getCollectionListings(),
        this.getCollectionStats()
      ]);
  
      const seen = new Set();
      const opportunities = [];
  
      for (const listing of listings) {
        const offer = listing.protocol_data?.parameters?.offer?.[0];
        if (!offer) continue;
        
        const tokenId = offer.identifierOrCriteria;
        if (!tokenId || seen.has(tokenId)) continue;
        seen.add(tokenId);
  
        const nftData = this.localNFTData.find(n => n.tokenId === tokenId);
        if (!nftData || nftData.officialRank > 1000) continue;
  
        const currentPrice = this.parsePrice(listing);
        if (!currentPrice) continue;
  
        const expectedPrice = this.getRarityPrice(
          nftData.officialRank,
          Math.max(stats.floor_price, 0.01), // Avoid division by zero
          stats.volume
        );
  
        const rarityPriceDiff = currentPrice - expectedPrice;
        
        // Calculate bargain score
        const priceDiffPercentage = ((expectedPrice - currentPrice) / expectedPrice) * 100;
        const rankBonus = (1000 - nftData.officialRank) / 10; // Max bonus ~100
        
        const bargainScore = Math.min(100, Math.max(0, priceDiffPercentage + rankBonus));
  
        // Log the calculations for each opportunity
        console.log(`Token ID: ${tokenId}`);
        console.log(`Official Rank: ${nftData.officialRank}`);
        console.log(`Current Price: ${currentPrice} ETH`);
        console.log(`Expected Price: ${expectedPrice.toFixed(3)} ETH`);
        console.log(`Price Difference: ${rarityPriceDiff.toFixed(3)} ETH`);
        console.log(`Bargain Score: ${bargainScore.toFixed(2)}`);
  
        opportunities.push({
          tokenId,
          imageUrl: nftData.imageUrl,
          officialRank: nftData.officialRank,
          rarityScore: nftData.rarityScore,
          currentPrice,
          expectedPrice,
          rarityPriceDiff,
          bargainScore,
          floorPrice: stats.floor_price
        });
      }
  
      // Sort by bargain score descending
      return opportunities.sort((a, b) => b.bargainScore - a.bargainScore);
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }
}

export default OpenSeaService;
