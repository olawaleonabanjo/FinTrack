import React from 'react';
import { Account } from '@/types';
import { Card } from '@/components/common/Card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';
import { Wallet, CreditCard, Landmark, TrendingUp } from 'lucide-react';

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { currency } = useThemeStore();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Landmark className="w-5 h-5" />;
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'credit':
        return <CreditCard className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Landmark className="w-5 h-5" />;
    }
  };

  const isCredit = account.type === 'credit';

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      {/* Visual Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: account.color }}
      />

      <div className="flex items-start justify-between mt-1 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: account.color }}
          >
            {getAccountIcon(account.type)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {account.name}
            </h4>
            <p className="text-xs text-slate-400">
              {account.institution} • {account.accountNumber}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border">
          {account.type}
        </span>
      </div>

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {isCredit ? 'Current Balance (Owed)' : 'Available Balance'}
        </p>
        <h3
          className={`text-2xl font-black mt-1 ${
            isCredit && account.balance < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatCurrency(account.balance, currency)}
        </h3>
      </div>

      <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Updated: {formatDate(account.updatedAt)}</span>
        <span className="text-brand-400 font-semibold cursor-pointer hover:underline">
          View Ledger →
        </span>
      </div>
    </Card>
  );
};
