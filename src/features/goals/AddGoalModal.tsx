import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { goalSchema, GoalFormData } from '@/lib/validations/schemas';
import { useGoals } from '@/hooks/useGoals';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal, isAdding } = useGoals();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      name: '',
      targetAmount: undefined,
      currentAmount: 0,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Savings',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      await addGoal({
        ...data,
        color: '#10b981',
        iconName: 'Target',
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Financial Goal"
      subtitle="Track target savings for major purchases or investments"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Goal Name"
          placeholder="e.g. New Car Down Payment, House Fund"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Amount ($)"
            type="number"
            step="0.01"
            placeholder="10000"
            {...register('targetAmount')}
            error={errors.targetAmount?.message}
          />
          <Input
            label="Initial Deposit ($)"
            type="number"
            step="0.01"
            placeholder="0"
            {...register('currentAmount')}
            error={errors.currentAmount?.message}
          />
        </div>

        <Input
          label="Target Completion Date"
          type="date"
          {...register('deadline')}
          error={errors.deadline?.message}
        />

        <Input
          label="Notes / Description (Optional)"
          placeholder="e.g. 20% down payment for house in Texas"
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isAdding}>
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
