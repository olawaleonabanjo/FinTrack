import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/lib/validations/schemas';
import { authApi } from '@/lib/api/financeApi';
import { useAuthStore } from '@/stores/useAuthStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { TrendingUp, Lock, Mail, User as UserIcon, AlertCircle, Clock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, sessionExpiredMessage, setSessionExpiredMessage } = useAuthStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form for Login
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form for Registration
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Helper to ensure server errors are always parsed to strings
  const extractErrorMessage = (err: any, fallback: string): string => {
    if (!err) return fallback;
    const raw = err.response?.data?.error ?? err.response?.data?.message ?? err.response?.data ?? err.message;
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      if (typeof raw.message === 'string') return raw.message;
      if (typeof raw.error === 'string') return raw.error;
      try {
        return JSON.stringify(raw);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSessionExpiredMessage(null);
    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Invalid email or password. Please try again.');
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSessionExpiredMessage(null);
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      const message = extractErrorMessage(err, 'Registration failed. Please try a different email.');
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 text-white shadow-glow-indigo mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider">
            Fin<span className="text-brand-400">Track</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isRegisterMode ? 'Create your personal financial OS account' : 'Sign in to your personal financial OS'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setServerError(null);
              setSessionExpiredMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegisterMode
                ? 'bg-brand-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setServerError(null);
              setSessionExpiredMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegisterMode
                ? 'bg-brand-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <Card glass className="p-8 border-slate-800">
          {sessionExpiredMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{typeof sessionExpiredMessage === 'string' ? sessionExpiredMessage : String(sessionExpiredMessage)}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{typeof serverError === 'string' ? serverError : (serverError as any)?.message || String(serverError)}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" />}
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
              />

              <Button type="submit" size="lg" isLoading={isLoading} className="mt-2 w-full">
                Sign In to FinTrack
              </Button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                icon={<UserIcon className="w-4 h-4" />}
                {...registerForm.register('name')}
                error={registerForm.formState.errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" />}
                {...registerForm.register('email')}
                error={registerForm.formState.errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                icon={<Lock className="w-4 h-4" />}
                {...registerForm.register('password')}
                error={registerForm.formState.errors.password?.message}
              />

              <Button type="submit" size="lg" isLoading={isLoading} className="mt-2 w-full">
                Create & Setup Account
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              {!isRegisterMode ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setServerError(null);
                      setSessionExpiredMessage(null);
                    }}
                    className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setServerError(null);
                      setSessionExpiredMessage(null);
                    }}
                    className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
