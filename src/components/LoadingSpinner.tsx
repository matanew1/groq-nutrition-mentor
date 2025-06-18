
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-2 sm:mt-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
