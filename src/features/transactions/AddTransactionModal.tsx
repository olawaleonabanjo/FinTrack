import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { transactionSchema, TransactionFormData } from '@/lib/validations/schemas';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, isAdding } = useTransactions();
  const { accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      title: '',
      amount: undefined,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || 'acc_1',
      status: 'completed',
      merchant: '',
      notes: '',
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const selectedAcc = accounts.find((a) => a.id === data.accountId);
      await addTransaction({
        ...data,
        accountName: selectedAcc ? selectedAcc.name : 'Primary Account',
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const accountOptions = accounts.map((a) => ({
    label: `${a.name} (${a.institution})`,
    value: a.id,
  }));

  const categoryOptions = [
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
    { label: 'Education', value: 'Education' },
    { label: 'Subscriptions', value: 'Subscriptions' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Other', value: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Transaction"
      subtitle="Log an income, expense, or transfer"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Transaction Title"
          placeholder="e.g. Grocery Shopping at Whole Foods"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            error={errors.amount?.message}
          />
          <Select
            label="Type"
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
              { label: 'Transfer', value: 'transfer' },
            ]}
            {...register('type')}
            error={errors.type?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            {...register('category')}
            error={errors.category?.message}
          />
          <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
        </div>

        <Select
          label="Account"
          options={accountOptions.length > 0 ? accountOptions : [{ label: 'Primary Checking', value: 'acc_1' }]}
          {...register('accountId')}
          error={errors.accountId?.message}
        />

        <Input
          label="Merchant / Payee (Optional)"
          placeholder="e.g. Target, Uber, Starbucks"
          {...register('merchant')}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isAdding}>
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
