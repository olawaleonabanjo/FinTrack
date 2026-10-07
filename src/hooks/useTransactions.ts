import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/financeApi';
import { Transaction } from '@/types';

export function useTransactions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: () => financeApi.getTransactions(),
  });

  const addTransactionMutation = useMutation({
    mutationFn: (tx: Omit<Transaction, 'id'>) => financeApi.addTransaction(tx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addTransaction: addTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isAdding: addTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
}
