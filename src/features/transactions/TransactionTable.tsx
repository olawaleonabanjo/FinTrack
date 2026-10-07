import React from 'react';
import { Transaction } from '@/types';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils/formatters';
import { useThemeStore } from '@/stores/useThemeStore';
import { Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  compact?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  compact = false,
}) => {
  const { currency } = useThemeStore();
  const { deleteTransaction } = useTransactions();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm">No transactions found matching your filter.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-dark-border text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Transaction</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Account</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Amount</th>
            {!compact && <th className="py-3 px-4 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50 text-xs sm:text-sm">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const color = getCategoryColor(tx.category);

            return (
              <tr
                key={tx.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Title & Type Icon */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15`, color: color }}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                      ) : isTransfer ? (
                        <RefreshCw className="w-4 h-4 text-brand-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-[240px]">
                        {tx.title}
                      </p>
                      {tx.merchant && (
                        <p className="text-[11px] text-slate-400 truncate">{tx.merchant}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: `${color}15`, color: color }}
                  >
                    {tx.category}
                  </span>
                </td>

                {/* Account */}
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                  {tx.accountName}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-slate-400 text-xs">{formatDate(tx.date)}</td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`font-bold ${
                      isIncome
                        ? 'text-emerald-500'
                        : isTransfer
                        ? 'text-brand-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </td>

                {/* Delete Action */}
                {!compact && (
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
