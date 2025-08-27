import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekInfo } from '../types';

interface WeekSelectorProps {
  weeks: WeekInfo[];
  selectedWeek: WeekInfo;
  onWeekChange: (week: WeekInfo) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ weeks, selectedWeek, onWeekChange }) => {
  const currentIndex = weeks.findIndex(week => week.weekNumber === selectedWeek.weekNumber);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onWeekChange(weeks[currentIndex - 1]);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < weeks.length - 1) {
      onWeekChange(weeks[currentIndex + 1]);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4">
          {weeks.map((week, index) => (
            <button
              key={week.weekNumber}
              onClick={() => onWeekChange(week)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                week.weekNumber === selectedWeek.weekNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {week.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === weeks.length - 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WeekSelector;
