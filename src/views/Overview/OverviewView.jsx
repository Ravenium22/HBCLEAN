// src/views/Overview/OverviewView.jsx

import React from 'react';
import { Tag, BarChart2, Users, Activity, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import useOverview from '../../hooks/useOverview';

function OverviewView() {
  const { loading, error, stats, priceGap } = useOverview('hungrybera');

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-secondary/60">Loading overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Define your stat cards
  const statCards = [
    {
      title: 'Floor Price',
      value: `${stats.floor_price.toFixed(3)} ETH`,
      icon: Tag
    },
    {
      title: '24h Volume',
      value: `${stats.volume.toFixed(2)} ETH`,
      icon: BarChart2
    },
    {
      title: 'Owners',
      value: stats.num_owners.toLocaleString(),
      icon: Users
    },
    {
      title: 'Total Sales',
      value: stats.sales.toLocaleString(),
      icon: Activity
    },
    {
      title: 'Price Gap (Best Offer - Floor Price)',
      value: `${priceGap.toFixed(3)} ETH`,
      icon: priceGap >= 0 ? TrendingUp : TrendingDown
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-secondary mb-2">
            COLLECTION OVERVIEW
          </h1>
          <p className="font-sans text-secondary/60">
            Latest stats for HungryBera
          </p>
        </div>

        <a
          href="https://opensea.io/collection/hungrybera"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-secondary rounded-lg transition-all"
        >
          <span className="font-sans">View on OpenSea</span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-secondary rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 ml-3">
                <p className="text-sm font-sans text-accent mb-1">{stat.title}</p>
                <p className="text-2xl font-display text-dark">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* About, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-secondary rounded-lg p-6">
          <h2 className="font-display text-2xl text-accent mb-4">ABOUT HUNGRYBERA</h2>
          <p className="font-sans text-dark">
            HungryBera is a unique NFT collection featuring 7,500 pieces.
            This collection has built a strong community and established itself 
            as a notable project in the NFT space, living on Arbitrum.
          </p>
        </div>
        <div className="bg-secondary rounded-lg p-6">
          <h2 className="font-display text-2xl text-accent mb-4">QUICK LINKS</h2>
          <div className="space-y-3">
            {['Discord', 'Twitter', 'Website'].map((link) => (
              <a
                key={link}
                href="#"
                className="flex items-center justify-between p-3 bg-dark rounded-lg text-secondary hover:bg-dark/80 transition-all"
              >
                <span className="font-sans">{link}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewView;
