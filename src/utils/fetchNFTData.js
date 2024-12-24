// src/utils/fetchNFTData.js
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OpenSeaService {
  constructor() {
    this.baseUrl = 'https://api.opensea.io/api/v2';
    this.headers = {
      'X-API-KEY': process.env.VITE_OPENSEA_API_KEY,
      'Accept': 'application/json'
    };
    this.contractAddress = '0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca';
    this.chain = 'arbitrum';
  }

  async getNFTs(cursor = null, limit = 50) {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (cursor) params.append('next', cursor);

      const url = `${this.baseUrl}/chain/${this.chain}/contract/${this.contractAddress}/nfts?${params}`;
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`NFTs error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        nfts: data?.nfts || [],
        next: data?.next || null
      };
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return { nfts: [], next: null };
    }
  }

  async getSingleNFT(tokenId) {
    try {
      const url = `${this.baseUrl}/chain/${this.chain}/contract/${this.contractAddress}/nfts/${tokenId}`;
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        console.error(`Single NFT not OK: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data?.nft || null;
    } catch (error) {
      console.error(`Error fetching single NFT #${tokenId}:`, error);
      return null;
    }
  }
}

class NFTDataFetcher {
  constructor() {
    this.openSeaService = new OpenSeaService();
    this.outputPath = path.join(process.cwd(), 'src', 'data', 'nft-data.json');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchAllNFTs() {
    const allNFTs = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
      try {
        console.log('Fetching batch with cursor:', cursor);
        const { nfts: rawNFTs, next } = await this.openSeaService.getNFTs(cursor, 50);
        
        for (const nft of rawNFTs) {
          await this.sleep(300); // Respect rate limits
          const details = await this.openSeaService.getSingleNFT(nft.identifier);
          
          if (details && details.rarity?.rank) {
            allNFTs.push({
              tokenId: nft.identifier,
              imageUrl: nft.image_url,
              officialRank: details.rarity?.rank || 999999,
              rarityScore: details.rarity?.score || 0,
              traits: details.traits || [],
              lastUpdated: new Date().toISOString()
            });
          }
          
          console.log(`Processed NFT #${nft.identifier} - Rank: ${details?.rarity?.rank || 'N/A'}`);
        }

        cursor = next;
        hasMore = Boolean(next);
        
        // Save progress periodically
        await this.saveToFile(allNFTs);
        
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        await this.saveToFile(allNFTs);
        hasMore = false;
      }
    }

    return allNFTs;
  }

  async saveToFile(data) {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
      
      // Save data
      await fs.writeFile(
        this.outputPath,
        JSON.stringify({ 
          nfts: data,
          lastUpdated: new Date().toISOString() 
        }, null, 2)
      );
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}

async function main() {
  if (!process.env.VITE_OPENSEA_API_KEY) {
    console.error('Error: VITE_OPENSEA_API_KEY environment variable is not set');
    process.exit(1);
  }

  const fetcher = new NFTDataFetcher();
  console.log('Starting NFT data update...');
  await fetcher.fetchAllNFTs();
  console.log('NFT data update completed');
}

// Run if called directly
main().catch(console.error);