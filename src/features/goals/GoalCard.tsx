import React, { useState } from 'react';
import { FinancialGoal } from '@/types';
import { Card } from '@/components/common/Card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';
import { Target, Calendar, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useGoals } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: FinancialGoal;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { currency } = useThemeStore();
  const { depositToGoal } = useGoals();
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositInput, setShowDepositInput] = useState(false);

  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const handleDeposit = async () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      await depositToGoal({ id: goal.id, amount: val });
      setDepositAmount('');
      setShowDepositInput(false);
    }
  };

  return (
    <Card hoverEffect className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {goal.name}
              </h4>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(goal.deadline)}
              </span>
            </div>
          </div>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> Reached!
            </span>
          )}
        </div>

        {/* Progress Display */}
        <div className="flex justify-between items-baseline my-3">
          <div>
            <span className="text-xs text-slate-400">Current: </span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {formatCurrency(goal.currentAmount, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Target: </span>
            <span className="font-bold text-slate-500 text-sm">
              {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full bg-slate-100 dark:bg-dark-bg rounded-full h-3.5 overflow-hidden border border-slate-200 dark:border-dark-border">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 rounded-full transition-all duration-500 shadow-glow-emerald"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
          <span>{percentage}% Achieved</span>
          <span>{formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), currency)} to go</span>
        </div>
      </div>

      {/* Quick Deposit Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
        {!isCompleted && !showDepositInput && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowDepositInput(true)}
          >
            Add Contribution
          </Button>
        )}

        {showDepositInput && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Amount $"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button size="sm" onClick={handleDeposit}>
              Deposit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDepositInput(false)}>
              ✕
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
