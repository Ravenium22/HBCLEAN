// src/services/api/alchemyService.js
import { Alchemy, Network } from 'alchemy-sdk';

class AlchemyService {
  constructor() {
    this.settings = {
      apiKey: "6AGg-7NKbqeyVBVaYVwit2OthYFzT3ba",
      network: Network.ARB_MAINNET
    };

    this.alchemy = new Alchemy(this.settings);
    this.hungrybera = "0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca";
  }

  async getTransferHistory(days = 30) {
    try {
      // Calculate fromBlock based on average block time (2 seconds for Arbitrum)
      const blocksPerDay = Math.ceil((24 * 60 * 60) / 2);
      const numberOfBlocks = blocksPerDay * days;
      const currentBlock = await this.alchemy.core.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - numberOfBlocks).toString(16);

      // Get NFT transfers
      const nftTransfers = await this.alchemy.core.getAssetTransfers({
        fromBlock: "0x" + fromBlock,
        contractAddresses: [this.hungrybera],
        category: ["erc721"],
        withMetadata: true,
        maxCount: 1000,
        order: "desc"
      });

      // Get corresponding ETH transfers
      const ethTransfers = await this.alchemy.core.getAssetTransfers({
        fromBlock: "0x" + fromBlock,
        category: ["external"],
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: 1000,
        order: "desc"
      });

      // Create price map from ETH transfers
      const priceMap = {};
      ethTransfers.transfers.forEach(tx => {
        if (tx.hash) {
          priceMap[tx.hash] = tx.value;
        }
      });

      // Enrich NFT transfers with price data
      return nftTransfers.transfers
        .filter(transfer => transfer.from !== "0x0000000000000000000000000000000000000000") // Exclude mints
        .map(transfer => ({
          ...transfer,
          salePrice: priceMap[transfer.hash] || 0
        }))
        .filter(t => t.salePrice > 0);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      throw error;
    }
  }

  async calculateDailyVolume() {
    try {
      const transfers = await this.getTransferHistory(30);
      const volumeByDay = {};
      
      // Initialize last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        volumeByDay[dateStr] = { date: dateStr, volume: 0, count: 0 };
      }

      // Process transfers
      transfers.forEach(transfer => {
        const date = new Date(transfer.metadata.blockTimestamp).toISOString().split('T')[0];
        if (volumeByDay[date]) {
          volumeByDay[date].volume = Number((volumeByDay[date].volume + Number(transfer.salePrice)).toFixed(3));
          volumeByDay[date].count++;
        }
      });

      return Object.values(volumeByDay)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error calculating daily volume:', error);
      throw error;
    }
  }

  async getHolders() {
    try {
      const response = await this.alchemy.nft.getContractMetadata(this.hungrybera);
      const owners = await this.alchemy.nft.getOwnersForContract(this.hungrybera);
      
      return {
        owners: owners.owners,
        totalCount: owners.owners.length,
        totalSupply: Number(response.totalSupply)
      };
    } catch (error) {
      console.error('Error fetching holders:', error);
      throw error;
    }
  }

  async calculateHoldingTimes() {
    try {
      // Get latest block for reference
      const latestBlock = await this.alchemy.core.getBlockNumber();
      
      // Get all transfers including mints
      const allTransfers = await this.alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        contractAddresses: [this.hungrybera],
        category: ["erc721"],
        withMetadata: true,
        maxCount: 1000
      });

      const currentTime = new Date();
      const lastTransferByToken = {};

      // Track last transfer for each token
      allTransfers.transfers.forEach(transfer => {
        const tokenId = transfer.tokenId;
        const timestamp = new Date(transfer.metadata.blockTimestamp);
        
        if (!lastTransferByToken[tokenId] || timestamp > lastTransferByToken[tokenId].timestamp) {
          lastTransferByToken[tokenId] = {
            timestamp,
            from: transfer.from,
            to: transfer.to
          };
        }
      });

      const holdingTimes = {
        '0-30d': 0,
        '30-90d': 0,
        '90-180d': 0,
        '180d+': 0
      };

      // Calculate holding times
      Object.values(lastTransferByToken).forEach(({ timestamp, to }) => {
        // Skip burned tokens
        if (to === '0x0000000000000000000000000000000000000000') return;
        
        const days = (currentTime - timestamp) / (1000 * 60 * 60 * 24);
        if (days <= 30) holdingTimes['0-30d']++;
        else if (days <= 90) holdingTimes['30-90d']++;
        else if (days <= 180) holdingTimes['90-180d']++;
        else holdingTimes['180d+']++;
      });

      // Convert to percentages
      const total = Object.values(holdingTimes).reduce((a, b) => a + b, 0);
      if (total > 0) {
        Object.keys(holdingTimes).forEach(key => {
          holdingTimes[key] = Number(((holdingTimes[key] / total) * 100).toFixed(1));
        });
      }

      return holdingTimes;
    } catch (error) {
      console.error('Error calculating holding times:', error);
      throw error;
    }
  }
}

export default AlchemyService;