
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
    <EnhancedCard variant="glass" className="lg:col-span-1">
      <EnhancedCardHeader>
        <EnhancedCardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          {t('selectDate')}
        </EnhancedCardTitle>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="calendar-enhanced">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onSelectDate(date)}
            className="rounded-xl border-0 w-full"
          />
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};
