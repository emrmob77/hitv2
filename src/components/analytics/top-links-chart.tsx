'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopLinksChartProps {
  data: Array<{
    name: string;
    clicks: number;
  }>;
}

export function TopLinksChart({ data }: TopLinksChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          width={150}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
