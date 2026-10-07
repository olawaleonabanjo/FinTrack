import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';

interface NetWorthPoint {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

interface NetWorthTrendChartProps {
  data: NetWorthPoint[];
}

export const NetWorthTrendChart: React.FC<NetWorthTrendChartProps> = ({ data }) => {
  const { currency } = useThemeStore();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl shadow-xl">
          <p className="font-semibold text-slate-400 mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <span className="text-indigo-400 font-bold flex justify-between gap-6">
              <span>Net Worth:</span>
              <span>{formatCurrency(payload[0].value, currency)}</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#netWorthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
