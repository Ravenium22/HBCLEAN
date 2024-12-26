// src/components/features/Opportunities/NFTCard.jsx

import React from 'react';
import { ExternalLink, Trophy, TrendingUp, TrendingDown, Star } from 'lucide-react';

const CHAIN = 'arbitrum';
const CONTRACT = '0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca';

function NFTCard({
  tokenId,
  imageUrl,
  officialRank,
  rarityScore = 0,
  currentPrice = 0,
  rarityPriceDiff = 0,
  bargainScore = 0
}) {
  const isUndervalued = rarityPriceDiff < 0;
  const absDiff = Math.abs(rarityPriceDiff || 0).toFixed(3);

  const getBargainColor = (score) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-emerald-400';
    if (score >= 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-secondary rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition-all">
      <div className="relative aspect-square">
        <img
          src={imageUrl || '/placeholder.png'}
          alt={`NFT #${tokenId}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-secondary">#{officialRank || '?'}</span>
        </div>
        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-secondary">{(rarityScore || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center bg-dark/30 p-2 rounded">
          <span className="text-xs text-secondary/60">Current Price</span>
          <span className="text-sm text-secondary">
            {(currentPrice || 0).toFixed(3)} ETH
          </span>
        </div>

        <div className="flex justify-between items-center bg-dark/30 p-2 rounded">
          <span className="text-xs text-secondary/60">Price Difference</span>
          <div className={`flex items-center ${isUndervalued ? 'text-green-500' : 'text-red-500'}`}>
            {isUndervalued ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            <span className="text-sm">{absDiff} ETH</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-dark/30 p-2 rounded">
          <span className="text-xs text-secondary/60">Bargain Score</span>
          <span className={`text-sm font-medium ${getBargainColor(bargainScore)}`}>
            {(bargainScore || 0).toFixed(1)}%
          </span>
        </div>

        <a
          href={`https://opensea.io/assets/${CHAIN}/${CONTRACT}/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
        >
          View on OpenSea
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default NFTCard;
