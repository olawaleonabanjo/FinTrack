import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'dark' | 'light';

interface ThemeState {
  themeMode: ThemeMode;
  theme: 'dark' | 'light';
  currency: string;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrency: (currency: string) => void;
}

const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getPreferredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';

  const savedPreference = localStorage.getItem('fintrack_theme_settings');
  if (savedPreference) {
    try {
      const parsed = JSON.parse(savedPreference);
      const mode = parsed?.state?.themeMode;
      if (mode === 'system' || mode === 'dark' || mode === 'light') {
        return mode;
      }
    } catch {
      // Ignore malformed persisted data and fall back to system preference
    }
  }

  return 'system';
};

const resolveTheme = (mode: ThemeMode): 'dark' | 'light' => {
  return mode === 'system' ? getSystemTheme() : mode;
};

const applyThemeToDocument = (theme: 'dark' | 'light') => {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: getPreferredThemeMode(),
      theme: resolveTheme(getPreferredThemeMode()),
      currency: 'USD',
      toggleTheme: () =>
        set((state) => {
          const nextMode = state.theme === 'dark' ? 'light' : 'dark';
          const nextTheme = resolveTheme(nextMode);
          applyThemeToDocument(nextTheme);
          return { themeMode: nextMode, theme: nextTheme };
        }),
      setThemeMode: (mode) => {
        const nextTheme = resolveTheme(mode);
        applyThemeToDocument(nextTheme);
        set({ themeMode: mode, theme: nextTheme });
      },
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme, themeMode: theme === getSystemTheme() ? 'system' : theme });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'fintrack_theme_settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const nextTheme = resolveTheme(state.themeMode);
          state.theme = nextTheme;
          applyThemeToDocument(nextTheme);
        }
      },
    }
  )
);
