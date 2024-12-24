// components/features/Analysis/components/PriceChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/common/Card/Card';

export const PriceChart = ({ data }) => {
  return (
    <Card title="Price History" className="h-[400px]">
      <LineChart width={800} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#D8382B" name="Price (ETH)" />
        <Line type="monotone" dataKey="volume" stroke="#FCA605" name="Volume" />
      </LineChart>
    </Card>
  );
};