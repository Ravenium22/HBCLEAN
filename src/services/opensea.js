// src/services/opensea.js

import nftDataJSON from '../data/Top1000.json';

const CHAIN = 'arbitrum';
const CONTRACT = '0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca';
const BASE_URL = 'https://api.opensea.io/api/v2'; // Adjust if using a proxy

const headers = {
  'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
  'Accept': 'application/json'
};

export const getCollectionStats = async (collectionSlug = 'hungrybera') => {
  try {
    const url = `${BASE_URL}/collections/${collectionSlug}/stats`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) throw new Error(`Stats error: ${response.status} ${response.statusText}`);
    
    const data = await response.json();

    console.log('getCollectionStats API Response:', JSON.stringify(data, null, 2));

    const parsedStats = {
      floor_price: Number(data?.total?.floor_price) || 0,
      volume: Number(data?.total?.volume) || 0,
      sales: Number(data?.total?.sales) || 0,
      num_owners: Number(data?.total?.num_owners) || 0,
      average_price: Number(data?.total?.average_price) || 0,
      market_cap: Number(data?.total?.market_cap) || 0
    };

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
};

export const getCollectionListings = async () => {
  try {
    let allListings = [];
    let next = null;
    
    do {
      const url = `${BASE_URL}/listings/collection/hungrybera/all?limit=50${next ? `&next=${next}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers
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
};

export const parsePrice = (listing) => {
  try {
    const priceStr = listing.price?.current?.value;
    return priceStr ? parseFloat(priceStr) / 1e18 : null; // Convert wei to ETH
  } catch (error) {
    console.error('Error parsing price:', error);
    return null;
  }
};

export const getRarityPrice = (rank, floor_price, volume) => {
  const baseMultiplier = 1.5; // Start at 1.5x floor
  const rankMultiplier = Math.pow(0.99, rank);
  const expectedPrice = floor_price * baseMultiplier * (1 + rankMultiplier);
  return expectedPrice;
};

export const getListedOpportunities = async () => {
  try {
    const [listings, stats] = await Promise.all([
      getCollectionListings(),
      getCollectionStats()
    ]);

    const seen = new Set();
    const opportunities = [];

    for (const listing of listings) {
      const offer = listing.protocol_data?.parameters?.offer?.[0];
      if (!offer) continue;
      
      const tokenId = offer.identifierOrCriteria;
      if (!tokenId || seen.has(tokenId)) continue;
      seen.add(tokenId);

      const nftData = nftDataJSON.nfts.find(n => n.tokenId === tokenId);
      if (!nftData || nftData.officialRank > 1000) continue;

      const currentPrice = parsePrice(listing);
      if (!currentPrice) continue;

      const expectedPrice = getRarityPrice(
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
};

// New function to get the best offer on floor price NFTs
export const getPriceGap = async (collectionSlug = 'hungrybera') => {
  try {
    const stats = await getCollectionStats(collectionSlug);
    const floorPrice = stats.floor_price;

    const listings = await getCollectionListings();
    const floorListings = listings.filter(listing => parsePrice(listing) === floorPrice);

    let bestOffer = 0;

    for (const listing of floorListings) {
      const offers = listing.offers || [];
      for (const offer of offers) {
        const offerPrice = parsePrice(offer);
        if (offerPrice && offerPrice > bestOffer) {
          bestOffer = offerPrice;
        }
      }
    }

    const priceGap = bestOffer - floorPrice;
    return priceGap;
  } catch (error) {
    console.error('Error fetching price gap:', error);
    return 0;
  }
};
