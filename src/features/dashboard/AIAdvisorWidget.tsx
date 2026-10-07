import React from 'react';
import { Card } from '@/components/common/Card';
import { Sparkles, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const AIAdvisorWidget: React.FC = () => {
  return (
    <Card glass className="relative overflow-hidden border-brand-500/30">
      {/* Background Ambient Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-glow-indigo flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">FinTrack AI Financial Intelligence</h3>
              <span className="bg-brand-500/20 text-brand-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Your savings rate is <span className="text-emerald-400 font-bold">59.1%</span> this month.
              You're currently projected to achieve your <span className="text-white font-semibold">"Emergency Reserve"</span> goal 2 months ahead of schedule!
            </p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex-shrink-0">
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Health Score
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">88<span className="text-xs text-slate-500">/100</span></p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <Button size="sm" leftIcon={<Zap className="w-4 h-4" />}>
            Optimize Cashflow
          </Button>
        </div>
      </div>
    </Card>
  );
};
