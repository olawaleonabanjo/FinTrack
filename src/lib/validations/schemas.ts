import { z } from 'zod';

export const transactionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.enum([
    'Housing',
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Salary',
    'Investments',
    'Freelance',
    'Education',
    'Subscriptions',
    'Travel',
    'Other',
  ]),
  date: z.string().min(1, 'Date is required'),
  accountId: z.string().min(1, 'Account selection is required'),
  status: z.enum(['completed', 'pending']),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than 0'),
  period: z.enum(['monthly', 'yearly']),
  color: z.string().optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

export const goalSchema = z.object({
  name: z.string().min(2, 'Goal name must be at least 2 characters'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than 0'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative'),
  deadline: z.string().min(1, 'Target date is required'),
  category: z.string().min(1, 'Category is required'),
  color: z.string().optional(),
  notes: z.string().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const accountSchema = z.object({
  name: z.string().min(2, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'credit', 'investment']),
  balance: z.coerce.number(),
  accountNumber: z.string().min(4, 'Account number/mask is required'),
  institution: z.string().min(2, 'Bank or institution name is required'),
  color: z.string().optional(),
  currency: z.string().default('USD'),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
