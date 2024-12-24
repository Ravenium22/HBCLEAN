// src/components/features/Opportunities/NFTCard.jsx

import React from 'react';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

const CHAIN = 'arbitrum';
const CONTRACT = '0xaC59F7E7e5da0dC4f416A7aEfF7a49aC284f10Ca';

function NFTCard({
  tokenId,
  imageUrl,
  officialRank,
  rarityScore,
  currentPrice,
  rarityPriceDiff
}) {
  const isUndervalued = rarityPriceDiff < 0;
  const absDiff = Math.abs(rarityPriceDiff).toFixed(3);

  return (
    <div className="bg-secondary rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition-all">
      <div className="relative aspect-square">
        <img
          src={imageUrl || '/placeholder.png'}
          alt={`NFT #${tokenId}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg text-xs text-secondary">
          #{tokenId}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-secondary/60">Official Rank</p>
            <p className="text-lg font-display text-secondary">#{officialRank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-secondary/60">Rarity Score</p>
            <p className="text-lg font-display text-secondary">
              {rarityScore.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-dark/30 p-2 rounded">
          <span className="text-xs text-secondary/60">Current Price</span>
          <span className="text-sm text-secondary">
            {currentPrice.toFixed(3)} ETH
          </span>
        </div>

        <div className="flex justify-between items-center bg-dark/30 p-2 rounded">
          <span className="text-xs text-secondary/60">Rarity Price Diff</span>
          <div
            className={`flex items-center ${
              isUndervalued ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isUndervalued ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 mr-1" />
            )}
            <span className="text-sm">{absDiff} ETH</span>
          </div>
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
