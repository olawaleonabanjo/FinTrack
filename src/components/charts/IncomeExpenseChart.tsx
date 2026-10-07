import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';

interface DataPoint {
  month: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: DataPoint[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const { currency } = useThemeStore();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl shadow-xl">
          <p className="font-semibold text-slate-300 mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <span className="text-emerald-400 font-medium flex justify-between gap-4">
              <span>Income:</span>
              <span>{formatCurrency(payload[0].value, currency)}</span>
            </span>
            <span className="text-rose-400 font-medium flex justify-between gap-4">
              <span>Expense:</span>
              <span>{formatCurrency(payload[1].value, currency)}</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
          />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
