import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency, getCategoryColor } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const { currency } = useThemeStore();

  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  const formattedData = data.map((d) => ({
    ...d,
    color: getCategoryColor(d.category),
    percentage: total > 0 ? ((d.amount / total) * 100).toFixed(1) : '0',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl shadow-xl">
          <p className="font-semibold" style={{ color: item.color }}>
            {item.category}
          </p>
          <p className="text-slate-200 mt-1 font-bold">
            {formatCurrency(item.amount, currency)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6">
      <div className="w-full md:w-1/2 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="amount"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
        {formattedData.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="text-slate-400 text-[10px] ml-1.5">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
