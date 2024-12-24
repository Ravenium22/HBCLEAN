// src/services/api/OpenSeaService.js
import nftData from '../../data/nft-data.json';

class OpenSeaService {
  constructor() {
    this.baseUrl = '/api/v2';
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
      
      if (!response.ok) throw new Error(`Stats error: ${response.status}`);
      
      const data = await response.json();
      return {
        floor_price: Number(data?.total?.floor_price) || 0,
        volume: Number(data?.total?.volume) || 0,
        sales: Number(data?.total?.sales) || 0,
        num_owners: Number(data?.total?.num_owners) || 0,
        average_price: Number(data?.total?.average_price) || 0,
        market_cap: Number(data?.total?.market_cap) || 0
      };
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
    const basePrice = floor_price * 1.5; // Start at 1.5x floor
    const rankMultiplier = Math.pow(0.99, rank); // Exponential decay based on rank
    return basePrice * (1 + rankMultiplier);
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

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        allListings = [...allListings, ...(data?.listings || [])];
        next = data?.next;

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
      const consideration = listing.protocol_data?.parameters?.consideration;
      if (!consideration?.length) return null;
      const price = consideration[0]?.startAmount;
      return price ? parseFloat(price) / 1e18 : null;
    } catch (error) {
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
  
        const rarityPrice = this.getRarityPrice(
          nftData.officialRank,
          Math.max(stats.floor_price, 0.01), // Avoid division by zero
          stats.volume
        );
  
        const rarityPriceDiff = currentPrice - rarityPrice;
        
        // Improved bargain score calculation
        const priceDiffPercentage = ((rarityPrice - currentPrice) / rarityPrice) * 100;
        const floorPriceRatio = currentPrice / stats.floor_price;
        
        // Weight both rarity and floor price in bargain score
        const bargainScore = Math.min(100, Math.max(0, 
          (((rarityPrice - currentPrice) / rarityPrice) * 100) + // Price difference %
          ((1000 - nftData.officialRank) / 10) // Rank bonus (up to 100)
        ));
  
        opportunities.push({
          tokenId,
          imageUrl: nftData.imageUrl,
          officialRank: nftData.officialRank,
          rarityScore: nftData.rarityScore,
          currentPrice,
          rarityPrice,
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