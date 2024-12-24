// components/features/Analysis/components/VolumeMetrics.jsx
import { Card } from '@/components/common/Card/Card';
import { TrendingUp } from 'lucide-react';

export const VolumeMetrics = ({ data }) => {
  return (
    <Card title="Volume Metrics">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-[#D8382B]" />
            <h4 className="font-semibold">Daily Volume</h4>
          </div>
          <p className="text-2xl font-bold">{data?.dailyVolume} ETH</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-[#FCA605]" />
            <h4 className="font-semibold">Weekly Volume</h4>
          </div>
          <p className="text-2xl font-bold">{data?.weeklyVolume} ETH</p>
        </div>
      </div>
    </Card>
  );
};