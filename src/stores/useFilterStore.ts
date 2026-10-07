import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  categoryFilter: string;
  typeFilter: 'all' | 'income' | 'expense' | 'transfer';
  accountFilter: string;
  dateRange: 'all' | '30days' | '90days' | 'year';
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setTypeFilter: (type: 'all' | 'income' | 'expense' | 'transfer') => void;
  setAccountFilter: (accountId: string) => void;
  setDateRange: (range: 'all' | '30days' | '90days' | 'year') => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  categoryFilter: 'all',
  typeFilter: 'all',
  accountFilter: 'all',
  dateRange: 'all',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setAccountFilter: (accountFilter) => set({ accountFilter }),
  setDateRange: (dateRange) => set({ dateRange }),
  resetFilters: () =>
    set({
      searchQuery: '',
      categoryFilter: 'all',
      typeFilter: 'all',
      accountFilter: 'all',
      dateRange: 'all',
    }),
}));
