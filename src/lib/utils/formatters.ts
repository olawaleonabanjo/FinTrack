import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  NGN: '₦',
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Housing': '#6366f1', // Indigo
    'Food & Dining': '#f59e0b', // Amber
    'Transportation': '#06b6d4', // Cyan
    'Entertainment': '#ec4899', // Pink
    'Shopping': '#a855f7', // Purple
    'Utilities': '#64748b', // Slate
    'Healthcare': '#ef4444', // Red
    'Salary': '#10b981', // Emerald
    'Investments': '#3b82f6', // Blue
    'Freelance': '#84cc16', // Lime
    'Education': '#8b5cf6', // Violet
    'Subscriptions': '#f97316', // Orange
    'Travel': '#14b8a6', // Teal
    'Other': '#94a3b8',
  };
  return colorMap[category] || '#6366f1';
}
