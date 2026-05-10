import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: { date: string; amount: number }[];
  title?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#64748B"
            fontSize={12}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickFormatter={(value) => `¥${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
            }}
            formatter={(value) => [`¥${Number(value).toFixed(2)}`, '金额']}
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#1E3A5F"
            strokeWidth={2}
            dot={{ fill: '#1E3A5F', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
