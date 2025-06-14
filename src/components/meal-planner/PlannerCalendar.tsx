
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
    <div style={{ width: '100%' }}>
      <EnhancedCard variant="glass" style={{ height: '100%' }}>
        <EnhancedCardHeader>
          <EnhancedCardTitle style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <CalendarIcon style={{ height: '24px', width: '24px', color: '#2563eb' }} />
            <span style={{ fontSize: '18px' }}>{t('selectDate')}</span>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="calendar-enhanced" style={{ display: 'flex', justifyContent: 'center' }}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onSelectDate(date)}
              style={{
                borderRadius: '12px',
                border: 'none',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto'
              }}
            />
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};
