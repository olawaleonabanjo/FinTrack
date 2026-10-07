import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { budgetSchema, BudgetFormData } from '@/lib/validations/schemas';
import { useBudgets } from '@/hooks/useBudgets';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose }) => {
  const { addBudget, isAdding } = useBudgets();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      category: 'Food & Dining',
      targetAmount: undefined,
      period: 'monthly',
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      await addBudget({
        category: data.category as any,
        targetAmount: data.targetAmount,
        period: data.period,
        color: '#6366f1',
        iconName: 'Tag',
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to create budget:', err);
    }
  };

  const categoryOptions = [
    { label: 'Housing', value: 'Housing' },
    { label: 'Food & Dining', value: 'Food & Dining' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Subscriptions', value: 'Subscriptions' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Education', value: 'Education' },
    { label: 'Other', value: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Budget"
      subtitle="Set spending thresholds for your financial categories"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          {...register('category')}
          error={errors.category?.message}
        />

        <Input
          label="Target Budget Amount ($)"
          type="number"
          step="0.01"
          placeholder="e.g. 500"
          {...register('targetAmount')}
          error={errors.targetAmount?.message}
        />

        <Select
          label="Budget Period"
          options={[
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
          ]}
          {...register('period')}
          error={errors.period?.message}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isAdding}>
            Create Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};
