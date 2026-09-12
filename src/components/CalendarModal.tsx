import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { fromDateKey, toDateKey } from '../lib/date';

interface Props {
  selected: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarModal({ selected, onSelect, onClose }: Props) {
  const selectedDate = fromDateKey(selected);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth()); // 0-based

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const todayStr = toDateKey(new Date());

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="rounded-full p-1.5 hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-black text-gray-700">
            {viewYear}년 {viewMonth + 1}월
          </h3>
          <button onClick={() => changeMonth(1)} className="rounded-full p-1.5 hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
          <button onClick={onClose} className="ml-1 rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-gray-400">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <span key={idx} />;
            const key = toDateKey(new Date(viewYear, viewMonth, day));
            const isSelected = key === selected;
            const isToday = key === todayStr;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelect(key);
                  onClose();
                }}
                className={`aspect-square rounded-xl text-sm font-bold transition-colors ${
                  isSelected
                    ? 'bg-pink-400 text-white'
                    : isToday
                    ? 'bg-sky-100 text-sky-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
