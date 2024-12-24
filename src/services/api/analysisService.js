// src/services/api/analysisService.js
import DuneService from './duneService';

class AnalysisService {
  constructor() {
    this.duneService = new DuneService();
  }

  async fetchBasicStats() {
    try {
      const [marketMetrics, holderMetrics] = await Promise.all([
        this.duneService.getMarketMetrics(),
        this.duneService.getHolderMetrics()
      ]);

      return {
        volume24h: marketMetrics.volume24h,
        totalVolume: marketMetrics.totalVolume,
        averagePrice: marketMetrics.averagePrice,
        holderCount: holderMetrics.uniqueHolders
      };
    } catch (error) {
      console.error('Error in fetchBasicStats:', error);
      return {
        volume24h: 0,
        totalVolume: 0,
        averagePrice: 0,
        holderCount: 0
      };
    }
  }

  async fetchDetailedAnalysis() {
    try {
      const [dailyVolume, holdingTimes] = await Promise.all([
        this.duneService.getDailyVolume(),
        this.duneService.getHoldingDistribution()
      ]);

      return {
        dailyVolume,
        holdingTimes,
        holders: {
          totalCount: (await this.duneService.getHolderMetrics()).uniqueHolders
        }
      };
    } catch (error) {
      console.error('Error in fetchDetailedAnalysis:', error);
      return {
        dailyVolume: [],
        holdingTimes: {
          '0-30d': 0,
          '30-90d': 0,
          '90-180d': 0,
          '180d+': 0
        },
        holders: {
          totalCount: 0
        }
      };
    }
  }
}

export default AnalysisService;