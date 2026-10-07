import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/financeApi';
import { Account } from '@/types';

export function useAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: () => financeApi.getAccounts(),
  });

  const addAccountMutation = useMutation({
    mutationFn: (newAccount: Omit<Account, 'id' | 'updatedAt'>) => financeApi.addAccount(newAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    accounts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addAccount: addAccountMutation.mutateAsync,
    isAdding: addAccountMutation.isPending,
  };
}
