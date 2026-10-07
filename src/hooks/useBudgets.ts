import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/financeApi';
import { Budget } from '@/types';

export function useBudgets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['budgets'],
    queryFn: () => financeApi.getBudgets(),
  });

  const addBudgetMutation = useMutation({
    mutationFn: (b: Omit<Budget, 'id' | 'spentAmount'>) => financeApi.addBudget(b),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Budget> }) =>
      financeApi.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addBudget: addBudgetMutation.mutateAsync,
    updateBudget: updateBudgetMutation.mutateAsync,
    isAdding: addBudgetMutation.isPending,
  };
}
