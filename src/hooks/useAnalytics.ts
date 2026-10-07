import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/financeApi';

export function useAnalytics() {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: () => financeApi.getAnalyticsData(),
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
