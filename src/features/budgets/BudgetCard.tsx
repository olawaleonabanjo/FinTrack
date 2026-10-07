import React from 'react';
import { Budget } from '@/types';
import { Card } from '@/components/common/Card';
import { formatCurrency, getCategoryColor } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const { currency } = useThemeStore();
  const color = getCategoryColor(budget.category);

  const percentage = Math.min(100, Math.round((budget.spentAmount / budget.targetAmount) * 100));
  const remaining = budget.targetAmount - budget.spentAmount;
  const isOver = budget.spentAmount > budget.targetAmount;

  return (
    <Card hoverEffect className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              {budget.category.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {budget.category}
              </h4>
              <p className="text-xs text-slate-400 capitalize">{budget.period} budget</p>
            </div>
          </div>

          {isOver ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertCircle className="w-3 h-3" /> Over limit
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> On Track
            </span>
          )}
        </div>

        {/* Numbers summary */}
        <div className="flex justify-between items-baseline my-2">
          <div>
            <span className="text-xs text-slate-400">Spent: </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {formatCurrency(budget.spentAmount, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Limit: </span>
            <span className="font-bold text-slate-500 text-sm">
              {formatCurrency(budget.targetAmount, currency)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-dark-bg rounded-full h-3 overflow-hidden border border-slate-200 dark:border-dark-border mt-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver
                ? 'bg-rose-500 shadow-glow-rose'
                : percentage > 85
                ? 'bg-amber-500'
                : 'bg-brand-500 shadow-glow-indigo'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-400">
          {isOver ? 'Exceeded by' : 'Remaining'}:
        </span>
        <span
          className={`font-bold ${
            isOver ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {formatCurrency(Math.abs(remaining), currency)}
        </span>
      </div>
    </Card>
  );
};
