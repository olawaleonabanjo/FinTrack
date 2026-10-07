import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'dark' | 'light';
  currency: string;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrency: (currency: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      currency: 'USD',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
          }
          return { theme: next };
        }),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        set({ theme });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'fintrack_theme_settings',
    }
  )
);
