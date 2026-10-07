import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useGoals } from '@/hooks/useGoals';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/common/Card';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { TransactionTable } from '@/features/transactions/TransactionTable';
import { AIAdvisorWidget } from '@/features/dashboard/AIAdvisorWidget';
import { GoalCard } from '@/features/goals/GoalCard';
import { AccountCard } from '@/features/accounts/AccountCard';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { searchQuery } = useFilterStore();
  const { analytics, isLoading: isAnalyticsLoading } = useAnalytics();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { goals } = useGoals();

  // Filter transactions based on global navbar search query if present
  const filteredTransactions = transactions.filter((t) =>
    searchQuery
      ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.merchant && t.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const recentTransactions = filteredTransactions.slice(0, 5);

  // Group spending by category for pie chart
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

  if (isAnalyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p className="text-sm font-medium animate-pulse">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's a real-time breakdown of your financial standing and cashflow.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border px-3 py-1.5 rounded-xl font-medium self-start sm:self-auto">
          September 2026 Summary
        </div>
      </div>

      {/* AI Financial Health Banner */}
      <AIAdvisorWidget />

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Worth"
          amount={analytics?.totalBalance || 0}
          change={4.2}
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-brand-500/10 text-brand-500"
          trend="up"
        />
        <StatCard
          title="Monthly Income"
          amount={analytics?.monthlyIncome || 0}
          change={8.5}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          trend="up"
        />
        <StatCard
          title="Monthly Expenses"
          amount={analytics?.monthlyExpenses || 0}
          change={-2.1}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-rose-500/10 text-rose-500"
          trend="down"
        />
        <StatCard
          title="Net Cashflow"
          amount={analytics?.cashFlow || 0}
          change={12.4}
          icon={<PiggyBank className="w-5 h-5" />}
          iconBgColor="bg-indigo-500/10 text-indigo-500"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-400">Past 6 months cashflow trajectory</p>
            </div>
          </div>
          <IncomeExpenseChart data={analytics?.monthlyIncomeVsExpense || []} />
        </Card>

        {/* Spending Category Pie Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Spending Breakdown
              </h3>
              <p className="text-xs text-slate-400">Expense category share</p>
            </div>
          </div>
          <CategoryPieChart data={categoryPieData} />
        </Card>
      </div>

      {/* Linked Accounts Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Connected Accounts</h3>
          <Link
            to="/accounts"
            className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            View All ({accounts.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Activity
              </h3>
              <p className="text-xs text-slate-400">Latest completed transactions</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <TransactionTable transactions={recentTransactions} compact />
        </Card>

        {/* Active Financial Goals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Top Priority Goal
              </h3>
              <p className="text-xs text-slate-400">Savings milestone progress</p>
            </div>
            <Link
              to="/goals"
              className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1"
            >
              All Goals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {goals[0] ? (
            <GoalCard goal={goals[0]} />
          ) : (
            <p className="text-xs text-slate-400">No active goals configured.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
