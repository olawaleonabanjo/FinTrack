import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useThemeStore } from '@/stores/useThemeStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GoalCard } from '@/features/goals/GoalCard';
import { AddGoalModal } from '@/features/goals/AddGoalModal';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Target, Trophy, Sparkles } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals, isLoading } = useGoals();
  const { currency } = useThemeStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPercentage =
    totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const completedCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Goals & Savings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track long-term savings targets, emergency funds, and major purchase milestones.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          New Financial Goal
        </Button>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Target Savings</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalTarget, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Accumulated Balance</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalSaved, currency)}{' '}
              <span className="text-xs text-emerald-500 font-bold">({overallPercentage}%)</span>
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Completed Goals</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {completedCount} of {goals.length} Goals
            </p>
          </div>
        </Card>
      </div>

      {/* Goal Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading goals...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
