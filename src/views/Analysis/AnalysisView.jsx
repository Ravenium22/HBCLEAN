// src/views/Analysis/AnalysisView.jsx
import React from 'react';
import { Card } from '../../components/common/Card';
import { Wallet, TrendingUp, Users, Activity } from 'lucide-react';

const MetricCard = ({ title, icon: Icon, embedUrl, isWide = false }) => (
  <div className={`${isWide ? 'col-span-2' : 'col-span-1'}`}>
    <Card className="bg-secondary p-4 h-[400px]">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-sm font-sans text-accent">{title}</h3>
        </div>
        <div className="relative flex-1 w-full">
          <iframe
            src={embedUrl}
            frameBorder="0"
            className="absolute inset-0 w-full h-full"
            style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
            title={title}
            scrolling="no"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        </div>
      </div>
    </Card>
  </div>
);

export const AnalysisView = () => {
  const metrics = [
    {
      title: "Secondary Market Volume Daily",
      icon: TrendingUp,
      embedUrl: "https://dune.com/embeds/4157383/6997491",
      isWide: true
    },
    {
      title: "Average Price By Date",
      icon: Activity,
      embedUrl: "https://dune.com/embeds/4157304/6997501",
      isWide: true
    },
    {
      title: "Unique Holders",
      icon: Users,
      embedUrl: "https://dune.com/embeds/4158634/6999246"
    },
    {
      title: "HC and HB Holders Total",
      icon: Wallet,
      embedUrl: "https://dune.com/embeds/4355418/7310915"
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-dark">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Buyback Analysis */}
      <Card className="bg-secondary p-6">
        <h2 className="font-display text-2xl text-accent mb-6">BUYBACK ANALYSIS</h2>
        <div className="relative h-[400px]">
          <iframe
            src="https://dune.com/embeds/4363227/7321832"
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            title="HungryBera Buyback Analysis"
            scrolling="no"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups"
            style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AnalysisView;