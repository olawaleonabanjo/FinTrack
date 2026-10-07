import { apiClient } from './axios';
import { Account, Budget, FinancialGoal, Transaction, User, AnalyticsOverview } from '@/types';
import { LoginFormData, RegisterFormData } from '../validations/schemas';

// Authentication API methods
export const authApi = {
  async login(credentials: LoginFormData): Promise<{ token: string; user: User; message: string }> {
    const response = await apiClient.post<{ token: string; user: User; message: string }>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<{ token: string; user: User; message: string }> {
    const response = await apiClient.post<{ token: string; user: User; message: string }>('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const response = await apiClient.put<{ user: User }>('/auth/profile', updates);
    return response.data;
  },
};

// Core Finance API connected to Express + SQLite backend
export const financeApi = {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<Account[]>('/accounts');
    return response.data;
  },

  async addAccount(accountData: Omit<Account, 'id' | 'updatedAt'>): Promise<Account> {
    const response = await apiClient.post<Account>('/accounts', accountData);
    return response.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },

  // Transactions
  async getTransactions(params?: { accountId?: string; category?: string; type?: string; search?: string }): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  async addTransaction(txData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', txData);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const response = await apiClient.get<Budget[]>('/budgets');
    return response.data;
  },

  async addBudget(budgetData: Omit<Budget, 'id' | 'spentAmount'>): Promise<Budget> {
    const response = await apiClient.post<Budget>('/budgets', budgetData);
    return response.data;
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, updates);
    return response.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },

  // Goals
  async getGoals(): Promise<FinancialGoal[]> {
    const response = await apiClient.get<FinancialGoal[]>('/goals');
    return response.data;
  },

  async addGoal(goalData: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> {
    const response = await apiClient.post<FinancialGoal>('/goals', goalData);
    return response.data;
  },

  async updateGoalDeposit(id: string, amountToAdd: number, accountId?: string): Promise<FinancialGoal> {
    const response = await apiClient.post<FinancialGoal>(`/goals/${id}/deposit`, {
      amount: amountToAdd,
      accountId,
    });
    return response.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },

  // User profile
  async getUser(): Promise<User> {
    const response = await authApi.getMe();
    return response.user;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const response = await authApi.updateProfile(updates);
    return response.user;
  },

  // Analytics & Summary
  async getAnalyticsData(): Promise<AnalyticsOverview> {
    const response = await apiClient.get<AnalyticsOverview>('/analytics');
    return response.data;
  },
};
