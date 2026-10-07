import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Wallet,
  BarChart3,
  TrendingUp,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/formatters';
import { useAuthStore } from '@/stores/useAuthStore';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Accounts', path: '/accounts', icon: Wallet },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-300 border-r border-slate-800/80 p-4 w-64 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-3 py-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-glow-indigo">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-wider font-sans">
                Fin<span className="text-brand-400">Track</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Financial OS
              </p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-brand-600 text-white shadow-glow-indigo font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-800/80 pt-4 mt-auto">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/40 flex-shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30">{sidebarContent}</aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};
