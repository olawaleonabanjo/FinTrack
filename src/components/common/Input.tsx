import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/formatters';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 border-slate-300 dark:border-dark-border',
              icon && 'pl-10',
              error && 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
