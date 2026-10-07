import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { LoginPage } from '@/pages/LoginPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { TrendingUp } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center shadow-glow-indigo animate-bounce mb-4">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Authenticating secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { initAuth } = useAuthStore();
  useAutoLogout();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
