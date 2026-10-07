import React, { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useThemeStore } from '@/stores/useThemeStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AccountCard } from '@/features/accounts/AccountCard';
import { AddAccountModal } from '@/features/accounts/AddAccountModal';
import { TransactionTable } from '@/features/transactions/TransactionTable';
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Wallet, ShieldCheck, Landmark, CreditCard } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { accounts, isLoading } = useAccounts();
  const { transactions } = useTransactions();
  const { currency } = useThemeStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAccId, setSelectedAccId] = useState<string | 'all'>('all');

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const liquidCash = accounts
    .filter((a) => a.type === 'checking' || a.type === 'savings')
    .reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === 'credit' && a.balance < 0)
    .reduce((acc, a) => acc + Math.abs(a.balance), 0);

  const filteredTxs =
    selectedAccId === 'all'
      ? transactions
      : transactions.filter((t) => t.accountId === selectedAccId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Accounts & Portfolios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your checking, savings, credit, and investment accounts in one unified hub.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Link Account
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-500">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Consolidated Balance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalBalance, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Liquid Cash Reserves</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(liquidCash, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Credit Owed / Liabilities</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalLiabilities, currency)}
            </p>
          </div>
        </Card>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading connected accounts...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelectedAccId(selectedAccId === acc.id ? 'all' : acc.id)}
              className="cursor-pointer"
            >
              <AccountCard account={acc} />
            </div>
          ))}
        </div>
      )}

      {/* Account Ledger Section */}
      <Card className="mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Account Ledger History
            </h3>
            <p className="text-xs text-slate-400">
              {selectedAccId === 'all'
                ? 'Showing activity across all linked accounts'
                : `Filtered for ${accounts.find((a) => a.id === selectedAccId)?.name}`}
            </p>
          </div>
          {selectedAccId !== 'all' && (
            <Button size="sm" variant="outline" onClick={() => setSelectedAccId('all')}>
              Show All Accounts
            </Button>
          )}
        </div>
        <TransactionTable transactions={filteredTxs} compact />
      </Card>

      <AddAccountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
