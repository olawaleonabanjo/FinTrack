import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Monitor,
  Plus,
  Bell,
  Menu,
  DollarSign,
  Euro,
  PoundSterling,
} from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/stores/useThemeStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { Button } from '../common/Button';
import { AddTransactionModal } from '@/features/transactions/AddTransactionModal';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const { theme, themeMode, toggleTheme, currency, setCurrency, setThemeMode } = useThemeStore();
  const { searchQuery, setSearchQuery } = useFilterStore();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const currencyOptions = [
    { code: 'NGN', symbol: '₦', name: 'NGN (₦)' },
    { code: 'EUR', symbol: '€', name: 'EUR (€)' },
    { code: 'GBP', symbol: '£', name: 'GBP (£)' },
    { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$)' },
    { code: 'USD', symbol: '$', name: 'USD ($)' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-dark-border/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-dark-border"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions, merchants, accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Add Transaction */}
          <Button
            size="sm"
            onClick={() => setIsAddTxOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex"
          >
            Add Transaction
          </Button>
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="sm:hidden p-2 rounded-xl bg-brand-600 text-white shadow-glow-indigo"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme mode selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-card p-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <select
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
              className="bg-transparent text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer px-1.5 py-1.5"
              aria-label="Theme mode selector"
            >
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {option.label}
                </option>
              ))}
            </select>

            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Monitor className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h4>
                  <span className="text-[10px] text-brand-400 font-semibold">2 New</span>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <p className="font-semibold">Salary Deposited</p>
                    <p className="text-[11px] text-slate-400">+$8,500.00 transferred into Checking</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <p className="font-semibold">Food Budget Alert</p>
                    <p className="text-[11px] text-slate-400">71% of monthly dining budget reached</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Add Transaction Modal */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
    </>
  );
};
