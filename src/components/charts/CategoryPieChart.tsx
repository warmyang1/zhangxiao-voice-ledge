import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryPieChartProps {
  data: { name: string; value: number; color: string }[];
  title?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
            }}
            formatter={(value) => [`¥${Number(value).toFixed(2)}`, '金额']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-text-primary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
