import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

const LEAVE_TIMEOUT_MS = 60 * 1000; // 1 minute
const STORAGE_LEFT_KEY = 'fintrack_left_at';

export function useAutoLogout() {
  const { isAuthenticated, logout, setSessionExpiredMessage } = useAuthStore();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const performAutoLogout = () => {
      localStorage.removeItem(STORAGE_LEFT_KEY);
      setSessionExpiredMessage('You were logged out after leaving the app for more than 1 minute. Please log in again.');
      queryClient.clear();
      logout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away from tab or minimized browser
        const now = Date.now();
        localStorage.setItem(STORAGE_LEFT_KEY, now.toString());

        // Schedule background auto-logout after 1 minute
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          performAutoLogout();
        }, LEAVE_TIMEOUT_MS);
      } else if (document.visibilityState === 'visible') {
        // User returned to the app
        const leftAtStr = localStorage.getItem(STORAGE_LEFT_KEY);
        if (leftAtStr) {
          const elapsed = Date.now() - Number(leftAtStr);
          if (elapsed >= LEAVE_TIMEOUT_MS) {
            performAutoLogout();
          } else {
            // Returned safely within 1 minute
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            localStorage.removeItem(STORAGE_LEFT_KEY);
          }
        }
      }
    };

    const handlePageHide = () => {
      // User closed tab or navigated to another address
      localStorage.setItem(STORAGE_LEFT_KEY, Date.now().toString());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [isAuthenticated, logout, setSessionExpiredMessage, queryClient]);
}
