import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/formatters';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 border-slate-300 dark:border-dark-border cursor-pointer',
            error && 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-rose-500 mt-0.5">
            {typeof error === 'string' ? error : (error as any)?.message || String(error)}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
