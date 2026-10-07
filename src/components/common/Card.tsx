import React from 'react';
import { cn } from '@/lib/utils/formatters';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300',
        glass
          ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-glass'
          : 'bg-white dark:bg-dark-card border-slate-200/80 dark:border-dark-border/70 shadow-sm dark:shadow-none',
        hoverEffect && 'hover:border-brand-500/40 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
