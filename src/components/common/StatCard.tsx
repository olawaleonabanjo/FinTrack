import React from 'react';
import { Card } from './Card';
import { cn, formatCurrency } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';

interface StatCardProps {
  title: string;
  amount: number;
  change?: number;
  changePeriod?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  change,
  changePeriod = 'vs last month',
  icon,
  iconBgColor = 'bg-brand-500/10 text-brand-500',
  trend = 'neutral',
}) => {
  const { currency } = useThemeStore();

  const isPositive = trend === 'up' || (change !== undefined && change >= 0);

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {formatCurrency(amount, currency)}
          </h3>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                )}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-slate-400">{changePeriod}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 duration-200', iconBgColor)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
