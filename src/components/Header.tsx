import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Settings, Palette } from 'lucide-react';
import { ThemeSettings } from '../types';
import { addDays, formatKorean, todayKey } from '../lib/date';
import CalendarModal from './CalendarModal';
import HslColorPicker from './HslColorPicker';
import { WeatherInfo } from '../lib/weather';

interface Props {
  date: string;
  onDateChange: (date: string) => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  weather: WeatherInfo;
  theme: ThemeSettings;
  onThemeChange: (updater: (prev: ThemeSettings) => ThemeSettings) => void;
}

export default function Header({ date, onDateChange, editMode, onToggleEditMode, weather, theme, onThemeChange }: Props) {
  const [now, setNow] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [colorTarget, setColorTarget] = useState<'bgLineA' | 'bgLineB' | 'pointColor' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <header className="flex flex-col gap-3 rounded-[2rem] border-4 border-white/70 bg-white/80 p-4 shadow-lg backdrop-blur-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onDateChange(addDays(date, -1))}
          className="rounded-full bg-sky-50 p-2 text-sky-500 hover:bg-sky-100 active:scale-90"
          title="이전 날"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => onDateChange(todayKey())}
          className="rounded-full bg-sky-50 px-3 py-2 text-sm font-bold text-sky-500 hover:bg-sky-100 active:scale-95"
        >
          오늘
        </button>
        <button
          onClick={() => onDateChange(addDays(date, 1))}
          className="rounded-full bg-sky-50 p-2 text-sky-500 hover:bg-sky-100 active:scale-90"
          title="다음 날"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => setShowCalendar(true)}
          className="text-outline flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-lg font-black text-gray-700 hover:bg-pink-100 active:scale-95"
        >
          <CalendarDays size={20} className="text-pink-400" />
          {formatKorean(date)}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {editMode && (
          <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5">
            <Palette size={16} className="text-gray-400" />
            {(
              [
                { key: 'bgLineA' as const, label: '배경(하늘)' },
                { key: 'bgLineB' as const, label: '배경(핑크)' },
                { key: 'pointColor' as const, label: '포인트' },
              ]
            ).map((sw) => (
              <button
                key={sw.key}
                title={sw.label}
                onClick={() => setColorTarget(sw.key)}
                className="h-6 w-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: `hsl(${theme[sw.key].h} ${theme[sw.key].s}% ${theme[sw.key].l}%)` }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2">
          <span className="text-2xl">{weather.isDemo ? '🧪' : weather.emoji}</span>
          <span className="text-sm font-bold text-gray-600">{weather.description}</span>
          <span className="text-lg font-black text-gray-800">{weather.temp}°C</span>
          <span className="text-xs font-bold text-gray-400">미세먼지 {weather.pm10Grade}</span>
        </div>

        <div className="rounded-full bg-sky-50 px-4 py-2 text-lg font-black tabular-nums text-sky-600">{timeStr}</div>

        <button
          onClick={onToggleEditMode}
          className={`rounded-full p-2.5 transition-colors active:scale-90 ${
            editMode ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title="편집 모드"
        >
          <Settings size={20} />
        </button>
      </div>

      {showCalendar && <CalendarModal selected={date} onSelect={onDateChange} onClose={() => setShowCalendar(false)} />}
      {colorTarget && (
        <HslColorPicker
          title={colorTarget === 'pointColor' ? '포인트 색상' : colorTarget === 'bgLineA' ? '배경 색상 1 (하늘색 계열)' : '배경 색상 2 (핑크색 계열)'}
          value={theme[colorTarget]}
          onChange={(hsl) => onThemeChange((prev) => ({ ...prev, [colorTarget]: hsl }))}
          onClose={() => setColorTarget(null)}
        />
      )}
    </header>
  );
}
