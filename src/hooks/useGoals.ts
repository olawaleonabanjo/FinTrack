import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/financeApi';
import { FinancialGoal } from '@/types';

export function useGoals() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['goals'],
    queryFn: () => financeApi.getGoals(),
  });

  const addGoalMutation = useMutation({
    mutationFn: (g: Omit<FinancialGoal, 'id'>) => financeApi.addGoal(g),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const depositGoalMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      financeApi.updateGoalDeposit(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  return {
    goals: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addGoal: addGoalMutation.mutateAsync,
    depositToGoal: depositGoalMutation.mutateAsync,
    isAdding: addGoalMutation.isPending,
  };
}
