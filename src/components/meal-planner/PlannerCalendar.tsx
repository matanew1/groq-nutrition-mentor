import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/EnhancedCard';
import { useSettings } from '@/contexts/SettingsContext';

interface PlannerCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const PlannerCalendar = ({ selectedDate, onSelectDate }: PlannerCalendarProps) => {
  const { t, language } = useSettings();
  const isRTL = language === 'he';
  
  return (
    <div className="w-full p-0 m-0">
      <EnhancedCard variant="glass" className="h-full p-0 m-0">
        <EnhancedCardHeader className="pb-0 mb-0 pt-4">
          <EnhancedCardTitle className={`flex items-center justify-center sm:justify-start gap-3 ${isRTL ? 'flex-row-reverse' : ''} mt-0 pt-0`}>
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-base sm:text-lg">{t('selectDate')}</span>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent className="pt-0 mt-0">
          <div className="calendar-enhanced flex justify-center pt-0 mt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onSelectDate(date)}
              className="rounded-xl border-0 w-full max-w-sm mx-auto"
            />
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};
