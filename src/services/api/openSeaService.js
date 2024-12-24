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

  // Collection Stats for Overview
  async getCollectionStats(collectionSlug = 'hungrybera') {
    try {
      const url = `${this.baseUrl}/collections/${collectionSlug}/stats`;
      const response = await fetch(url, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Stats error: ${response.status}`);
      }

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
      console.error('Error fetching collection stats:', error);
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

  // Listings for Opportunities
  async getCollectionListings() {
    try {
      const url = `${this.baseUrl}/listings/collection/hungrybera/all?limit=50`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data?.listings || [];
    } catch (error) {
      console.error('Error fetching collection listings:', error);
      return [];
    }
  }

  getRarityPrice(rank) {
    if (rank <= 500) return 2.0;
    if (rank <= 1000) return 1.0;
    return 0.5;
  }

  parsePrice(listing) {
    try {
      const consideration = listing.protocol_data?.parameters?.consideration;
      if (!consideration?.length) return null;

      const priceItem = consideration[0];
      const price = priceItem?.startAmount;
      if (!price) return null;

      return parseFloat(price) / 1e18;
    } catch (error) {
      console.error('Error parsing price:', error);
      return null;
    }
  }

  async getListedOpportunities() {
    try {
      const listings = await this.getCollectionListings();
      
      const opportunities = listings
        .map(listing => {
          const offer = listing.protocol_data?.parameters?.offer?.[0];
          if (!offer) return null;

          const tokenId = offer.identifierOrCriteria;
          if (!tokenId) return null;

          const nftData = this.localNFTData.find(n => n.tokenId === tokenId);
          if (!nftData || nftData.officialRank > 1000) return null;

          const currentPrice = this.parsePrice(listing);
          if (!currentPrice) return null;

          const rarityPrice = this.getRarityPrice(nftData.officialRank);
          const rarityPriceDiff = currentPrice - rarityPrice;

          return {
            tokenId,
            imageUrl: nftData.imageUrl,
            officialRank: nftData.officialRank,
            rarityScore: nftData.rarityScore,
            currentPrice,
            rarityPriceDiff
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.currentPrice - b.currentPrice);

      return opportunities;
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return [];
    }
  }
}

export default OpenSeaService;