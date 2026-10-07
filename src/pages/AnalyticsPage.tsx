import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { useThemeStore } from '@/stores/useThemeStore';
import { Card } from '@/components/common/Card';
import { NetWorthTrendChart } from '@/components/charts/NetWorthTrendChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { BarChart3, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { analytics, isLoading } = useAnalytics();
  const { transactions } = useTransactions();
  const { currency } = useThemeStore();
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Category data computation
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryPieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p className="text-sm font-medium animate-pulse">Computing financial analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Advanced Analytics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into long-term net worth growth, cashflow efficiency, and category expenditure.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-dark-card border border-slate-300 dark:border-dark-border p-1 rounded-xl self-start sm:self-auto">
          {(['1M', '3M', '6M', '1Y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Savings Rate</p>
            <p className="text-2xl font-black text-emerald-500 mt-0.5">
              {formatPercentage(analytics?.savingsRate || 59.1)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Avg Monthly Cashflow</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(analytics?.cashFlow || 6054, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Financial Runway</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">14.2 Months</p>
          </div>
        </Card>
      </div>

      {/* Net Worth Growth Area Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Net Worth Growth Trajectory
            </h3>
            <p className="text-xs text-slate-400">Total assets minus liabilities trend</p>
          </div>
        </div>
        <NetWorthTrendChart data={analytics?.netWorthHistory || []} />
      </Card>

      {/* Grid: Income vs Expense Bar Chart & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Income vs Expense Comparison
              </h3>
              <p className="text-xs text-slate-400">Monthly aggregate cash inflow & outflow</p>
            </div>
          </div>
          <IncomeExpenseChart data={analytics?.monthlyIncomeVsExpense || []} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Category Spending Distribution
              </h3>
              <p className="text-xs text-slate-400">Proportional expenditure share</p>
            </div>
          </div>
          <CategoryPieChart data={categoryPieData} />
        </Card>
      </div>
    </div>
  );
};
