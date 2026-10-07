import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { accountSchema, AccountFormData } from '@/lib/validations/schemas';
import { useAccounts } from '@/hooks/useAccounts';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, isAdding } = useAccounts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: '',
      type: 'checking',
      balance: undefined,
      accountNumber: '•••• 0000',
      institution: '',
      color: '#6366f1',
      currency: 'USD',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      await addAccount({
        name: data.name,
        type: data.type,
        balance: data.balance,
        accountNumber: data.accountNumber,
        institution: data.institution,
        color: data.color || '#6366f1',
        currency: data.currency || 'USD',
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to link account:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link New Account"
      subtitle="Add a checking, savings, credit, or investment account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Account Name"
          placeholder="e.g. Primary Checking, Freedom Unlimited"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Account Type"
            options={[
              { label: 'Checking Account', value: 'checking' },
              { label: 'High-Yield Savings', value: 'savings' },
              { label: 'Credit Card', value: 'credit' },
              { label: 'Investment Portfolio', value: 'investment' },
            ]}
            {...register('type')}
            error={errors.type?.message}
          />
          <Input
            label="Institution / Bank"
            placeholder="e.g. Chase, Fidelity, Marcus"
            {...register('institution')}
            error={errors.institution?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Opening Balance ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('balance')}
            error={errors.balance?.message}
          />
          <Input
            label="Account Mask / Last 4 Digits"
            placeholder="•••• 4821"
            {...register('accountNumber')}
            error={errors.accountNumber?.message}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isAdding}>
            Link Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
