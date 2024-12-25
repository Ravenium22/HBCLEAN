// src/services/opensea.js
import nftData from '../data/nft-data.json';

export const getListedOpportunities = async () => {
  const baseUrl = '/api/v2';
  const headers = {
    'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
    'Accept': 'application/json'
  };

  try {
    // Fetch listings
    const url = `${baseUrl}/listings/collection/hungrybera/all?limit=50`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const listings = data?.listings || [];

    // Helper function to parse price
    const parsePrice = (listing) => {
      const consideration = listing.protocol_data?.parameters?.consideration;
      if (!consideration?.length) return null;
      const price = consideration[0]?.startAmount;
      return price ? parseFloat(price) / 1e18 : null;
    };

    // Process listings
    const seen = new Set();
    const opportunities = [];

    for (const listing of listings) {
      const tokenId = listing.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria;
      if (!tokenId || seen.has(tokenId)) continue;
      seen.add(tokenId);

      const nftData = nftData.nfts.find(n => n.tokenId === tokenId);
      if (!nftData || nftData.officialRank > 1000) continue;

      const currentPrice = parsePrice(listing);
      if (!currentPrice) continue;

      opportunities.push({
        tokenId,
        imageUrl: nftData.imageUrl,
        officialRank: nftData.officialRank,
        rarityScore: nftData.rarityScore,
        currentPrice,
        rarityPriceDiff: 0, // Simplified for now
        bargainScore: 0     // Simplified for now
      });
    }

    return opportunities.sort((a, b) => a.currentPrice - b.currentPrice);
  } catch (error) {
    console.error('Error getting opportunities:', error);
    return [];
  }
};

export const getCollectionStats = async (collectionSlug = 'hungrybera') => {
  const baseUrl = '/api/v2';
  const headers = {
    'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(`${baseUrl}/collections/${collectionSlug}/stats`, { headers });
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
    console.error('Error:', error);
    return {
      floor_price: 0,
      volume: 0,
      sales: 0,
      num_owners: 0,
      average_price: 0,
      market_cap: 0
    };
  }
};