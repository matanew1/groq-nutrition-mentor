
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center sm:text-left">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-enhanced',
            error && 'border-red-400 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center sm:text-left">{error}</p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
