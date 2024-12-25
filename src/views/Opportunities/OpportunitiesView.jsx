// src/views/Opportunities/OpportunitiesView.jsx
import React, { useState, useEffect } from 'react';
import NFTCard from '../../components/features/Opportunities/NFTCard.jsx';
import { OpenSeaService } from '@/services/api';
import { Loader2 } from 'lucide-react';

function OpportunitiesView() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const service = new OpenSeaService();
      const opportunities = await service.getListedOpportunities();
      // Remove duplicates based on tokenId
      const uniqueOpportunities = Array.from(
        new Map(opportunities.map(item => [item.tokenId, item])).values()
      );
      setNfts(uniqueOpportunities);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // NFT Grid section
  const renderNFTGrid = () => {
    if (loading && !nfts.length) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary/60" />
        </div>
      );
    }

    if (!nfts.length) {
      return (
        <div className="text-center py-12 text-secondary/60">
          No listed opportunities found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <NFTCard
            key={`${nft.tokenId}-${nft.currentPrice}`}
            tokenId={nft.tokenId}
            imageUrl={nft.imageUrl}
            officialRank={nft.officialRank}
            rarityScore={nft.rarityScore}
            currentPrice={nft.currentPrice}
            rarityPriceDiff={nft.rarityPriceDiff}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-display text-secondary mb-4">OPPORTUNITIES</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display text-secondary mb-2">
            Rare NFTs (Rank ≤ 1000) & Listed
          </h2>
          <p className="text-sm text-secondary/70">
            Found {nfts.length} listed items (Sorted by price)
          </p>
        </div>

        <button
          onClick={fetchOpportunities}
          disabled={loading}
          className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {renderNFTGrid()}
    </div>
  );
}

export default OpportunitiesView;