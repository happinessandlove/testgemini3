
import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { WEEKS, formatDate, getMonths, getDaysInMonth, isSameDay, isToday } from './utils';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
  title: string;
}

const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose, onConfirm, initialDate, title }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  // Generate next 6 months
  const [months] = useState(() => getMonths(new Date(), 6));
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
        <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">{title}</h2>
        <button className="p-1 hover:bg-blue-700 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 bg-white border-b border-gray-100 py-2 shrink-0 shadow-sm z-10">
        {WEEKS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-white">
        {months.map((monthDate, mIndex) => (
          <div key={mIndex} className="mb-6">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-3 text-center font-bold text-slate-800 text-base border-b border-gray-50 z-0">
              {monthDate.getFullYear()}年{monthDate.getMonth() + 1}月
            </div>
            <div className="grid grid-cols-7 gap-y-4 mt-2 px-2">
               {getDaysInMonth(monthDate).map((date, dIndex) => {
                 if (!date) return <div key={`empty-${mIndex}-${dIndex}`} />;
                 
                 const isSelected = isSameDay(date, selectedDate);
                 const isCurrentDay = isToday(date);
                 const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                 const isPast = date < new Date(new Date().setHours(0,0,0,0));

                 return (
                   <div 
                    key={date.toISOString()} 
                    onClick={() => !isPast && setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center h-12 rounded-lg relative cursor-pointer transition-all
                      ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105 z-10' : isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-blue-50'}
                    `}
                   >
                     <span className={`text-sm font-bold ${!isSelected && isWeekend && !isPast ? 'text-orange-500' : ''}`}>
                       {isCurrentDay ? '今天' : date.getDate()}
                     </span>
                     {isSelected && (
                       <span className="text-[9px] font-medium mt-0.5">去程</span>
                     )}
                     {/* Optional Price placeholder */}
                     {!isSelected && !isPast && (
                        <span className="text-[9px] text-gray-400 scale-90">
                          ¥{Math.floor(Math.random() * 500) + 200}
                        </span>
                     )}
                   </div>
                 );
               })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-20 flex items-center justify-between safe-area-bottom">
         <div className="flex flex-col">
           <span className="text-xs text-gray-400">已选日期</span>
           <span className="text-base font-bold text-slate-800">{formatDate(selectedDate)}</span>
         </div>
         <button 
           onClick={() => onConfirm(selectedDate)}
           className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
         >
           确定
         </button>
      </div>
    </div>
  );
};

export default Calendar;
