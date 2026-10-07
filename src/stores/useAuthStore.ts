import { create } from 'zustand';
import { User } from '@/types';
import { authApi } from '@/lib/api/financeApi';

const LEAVE_TIMEOUT_MS = 60 * 1000; // 1 minute

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  sessionExpiredMessage: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setSessionExpiredMessage: (message: string | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Listen for 401 unauthorization events from Axios interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('fintrack_unauthorized', () => {
      get().logout();
    });
  }

  return {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('fintrack_token') : null,
    isAuthenticated: false,
    isInitializing: true,
    sessionExpiredMessage: null,

    setAuth: (user: User, token: string) => {
      localStorage.setItem('fintrack_token', token);
      localStorage.removeItem('fintrack_left_at');
      set({
        user,
        token,
        isAuthenticated: true,
        isInitializing: false,
        sessionExpiredMessage: null,
      });
    },

    logout: () => {
      localStorage.removeItem('fintrack_token');
      localStorage.removeItem('fintrack_left_at');
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
    },

    setSessionExpiredMessage: (message: string | null) => {
      set({ sessionExpiredMessage: message });
    },

    updateUserProfile: (updates: Partial<User>) => {
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }));
    },

    initAuth: async () => {
      // Check if user was away for more than 1 minute before loading/refreshing
      const leftAtStr = typeof window !== 'undefined' ? localStorage.getItem('fintrack_left_at') : null;
      if (leftAtStr) {
        const elapsed = Date.now() - Number(leftAtStr);
        if (elapsed >= LEAVE_TIMEOUT_MS) {
          localStorage.removeItem('fintrack_left_at');
          localStorage.removeItem('fintrack_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isInitializing: false,
            sessionExpiredMessage: 'You were logged out after leaving the app for more than 1 minute. Please log in again.',
          });
          return;
        } else {
          // Returned within 1 minute
          localStorage.removeItem('fintrack_left_at');
        }
      }

      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('fintrack_token') : null;
      if (!storedToken) {
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
        return;
      }

      try {
        const { user } = await authApi.getMe();
        set({ user, token: storedToken, isAuthenticated: true, isInitializing: false });
      } catch (error) {
        console.warn('Session verification failed, logging out:', error);
        localStorage.removeItem('fintrack_token');
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
      }
    },
  };
});
