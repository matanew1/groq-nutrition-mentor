import { useContext } from 'react';
import { SettingsContext } from '@/contexts/SettingsContext';

/**
 * Custom hook for accessing the Settings context
 * @returns The settings context value
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
