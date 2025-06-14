
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export const EnhancedBadge = React.forwardRef<HTMLSpanElement, EnhancedBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'badge-enhanced',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

EnhancedBadge.displayName = 'EnhancedBadge';
