import { WeekInfo, DeliveryDay } from '../types';

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getWeekStartDate = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  });
};

export const getNext3Weeks = (): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  const today = new Date();
  
  for (let i = 0; i < 3; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7));
    const startOfWeek = getWeekStartDate(new Date(weekStart));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekNumber = getWeekNumber(startOfWeek);
    
    weeks.push({
      weekNumber,
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek),
      label: `Semaine ${weekNumber} (${formatDateDisplay(formatDate(startOfWeek))} - ${formatDateDisplay(formatDate(endOfWeek))})`
    });
  }
  
  return weeks;
};

export const getDateForDayInWeek = (weekStartDate: string, day: DeliveryDay): string => {
  const startDate = new Date(weekStartDate);
  const dayMap: Record<DeliveryDay, number> = {
    'mercredi': 2,
    'jeudi': 3,
    'vendredi': 4,
    'samedi': 5
  };
  
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + dayMap[day]);
  
  return formatDate(targetDate);
};

export const getDayFromDate = (dateString: string): DeliveryDay => {
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  
  const dayMap: Record<number, DeliveryDay> = {
    2: 'mercredi',
    3: 'jeudi',
    4: 'vendredi',
    5: 'samedi'
  };
  
  return dayMap[dayIndex] || 'mercredi';
};
