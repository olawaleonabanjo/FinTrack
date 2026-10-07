import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useThemeStore } from '@/stores/useThemeStore';

export const MainLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
