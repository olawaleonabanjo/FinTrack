import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useFilterStore } from '@/stores/useFilterStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { TransactionTable } from '@/features/transactions/TransactionTable';
import { AddTransactionModal } from '@/features/transactions/AddTransactionModal';
import { Plus, Search, Filter, RotateCcw, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export const TransactionsPage: React.FC = () => {
  const { transactions, isLoading } = useTransactions();
  const { accounts } = useAccounts();
  const { currency } = useThemeStore();
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    accountFilter,
    setAccountFilter,
    resetFilters,
  } = useFilterStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = searchQuery
      ? tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesCategory = categoryFilter !== 'all' ? tx.category === categoryFilter : true;
    const matchesType = typeFilter !== 'all' ? tx.type === typeFilter : true;
    const matchesAccount = accountFilter !== 'all' ? tx.accountId === accountFilter : true;

    return matchesSearch && matchesCategory && matchesType && matchesAccount;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Housing', value: 'Housing' },
    { label: 'Food & Dining', value: 'Food & Dining' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Salary', value: 'Salary' },
    { label: 'Investments', value: 'Investments' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Subscriptions', value: 'Subscriptions' },
    { label: 'Travel', value: 'Travel' },
  ];

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Transfer', value: 'transfer' },
  ];

  const accountOptions = [
    { label: 'All Accounts', value: 'all' },
    ...accounts.map((a) => ({ label: a.name, value: a.id })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and audit all financial movement across your linked accounts.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          New Transaction
        </Button>
      </div>

      {/* Summary Filter Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Income</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalIncome, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Expenses</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalExpenses, currency)}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-3">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Filtered Count</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {filteredTransactions.length} Transactions
            </p>
          </div>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card className="flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search by title or merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          />
          <Select
            options={accountOptions}
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={resetFilters}
          className="w-full md:w-auto flex-shrink-0"
          title="Reset filters"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </Card>

      {/* Main Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading transactions...</div>
        ) : (
          <TransactionTable transactions={filteredTransactions} />
        )}
      </Card>

      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
