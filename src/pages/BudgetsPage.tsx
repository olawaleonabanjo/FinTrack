import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useThemeStore } from '@/stores/useThemeStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { BudgetCard } from '@/features/budgets/BudgetCard';
import { AddBudgetModal } from '@/features/budgets/AddBudgetModal';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, PieChart, AlertTriangle } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { budgets, isLoading } = useBudgets();
  const { currency } = useThemeStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const overallPercentage =
    totalBudgetLimit > 0 ? Math.min(100, Math.round((totalSpent / totalBudgetLimit) * 100)) : 0;
  const overBudgetCount = budgets.filter((b) => b.spentAmount > b.targetAmount).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Budgets & Expense Limits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor month-to-month category spending limits and prevent overspending.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Create Budget
        </Button>
      </div>

      {/* Overall Budget Overview Card */}
      <Card glass className="border-brand-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Spending Envelope
              </p>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">
                {formatCurrency(totalSpent, currency)}{' '}
                <span className="text-sm text-slate-400 font-normal">
                  / {formatCurrency(totalBudgetLimit, currency)}
                </span>
              </h2>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>{overallPercentage}% Total Allocated Spent</span>
              <span>
                {formatCurrency(Math.max(0, totalBudgetLimit - totalSpent), currency)} Remaining
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 rounded-full transition-all duration-500 shadow-glow-indigo"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {overBudgetCount > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-semibold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Warning: {overBudgetCount} category budget has exceeded set limit.</span>
          </div>
        )}
      </Card>

      {/* Category Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading budgets...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>
      )}

      <AddBudgetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
