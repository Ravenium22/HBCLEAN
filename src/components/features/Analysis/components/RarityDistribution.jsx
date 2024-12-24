// components/features/Analysis/components/RarityDistribution.jsx
import { BarChart2 } from 'lucide-react';
import { Card } from '@/components/common/Card/Card';

export const RarityDistribution = ({ data }) => {
  return (
    <Card title="Rarity Distribution" className="h-[400px]">
      <div className="flex items-center space-x-4 mb-4">
        <BarChart2 className="text-[#D8382B]" />
        <h3 className="text-lg font-semibold">Trait Rarity Analysis</h3>
      </div>
      {/* Add rarity visualization here */}
    </Card>
  );
};