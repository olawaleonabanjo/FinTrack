export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Utilities'
  | 'Healthcare'
  | 'Salary'
  | 'Investments'
  | 'Freelance'
  | 'Education'
  | 'Subscriptions'
  | 'Travel'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  accountId: string;
  accountName: string;
  status: 'completed' | 'pending';
  merchant?: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  accountNumber: string;
  institution: string;
  color: string;
  currency: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  targetAmount: number;
  spentAmount: number;
  period: 'monthly' | 'yearly';
  color: string;
  iconName: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
  iconName: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
  monthlyBudgetLimit: number;
}

export interface AnalyticsOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  cashFlow: number;
  netWorthHistory: { month: string; netWorth: number; assets: number; liabilities: number }[];
  spendingByCategory: { category: TransactionCategory; amount: number; percentage: number; color: string }[];
  incomeVSExpenseMonthly: { month: string; income: number; expense: number }[];
  monthlyIncomeVsExpense: { month: string; income: number; expense: number }[];
}
