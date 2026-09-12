import React, { useEffect, useMemo, useState } from 'react';
import { useTheme, useDayData } from './lib/storage';
import { todayKey } from './lib/date';
import { fetchWeather, WeatherInfo, DEMO_WEATHER } from './lib/weather';
import { hslToCss } from './types';
import Header from './components/Header';
import SectionCard from './components/SectionCard';
import AttendanceWidget from './components/AttendanceWidget';
import DailyMessageWidget from './components/DailyMessageWidget';
import ActivityTimeline from './components/ActivityTimeline';
import PromisesWidget from './components/PromisesWidget';
import RolesWidget from './components/RolesWidget';
import MealTrayWidget from './components/MealTrayWidget';

export default function App() {
  const [date, setDate] = useState(todayKey());
  const [editMode, setEditMode] = useState(false);
  const [theme, setTheme] = useTheme();
  const [dayData, setDayData] = useDayData(date);
  const [weather, setWeather] = useState<WeatherInfo>(DEMO_WEATHER);

  useEffect(() => {
    fetchWeather().then(setWeather);
    const timer = setInterval(() => fetchWeather().then(setWeather), 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const backgroundStyle = useMemo(() => {
    const base = hslToCss(theme.bgBase);
    const lineA = hslToCss(theme.bgLineA, 0.55);
    const lineB = hslToCss(theme.bgLineB, 0.35);
    return {
      backgroundColor: base,
      backgroundImage: [
        `repeating-linear-gradient(0deg, ${lineA} 0 20px, transparent 20px 40px)`,
        `repeating-linear-gradient(90deg, ${lineA} 0 20px, transparent 20px 40px)`,
        `repeating-linear-gradient(0deg, ${lineB} 0 40px, transparent 40px 80px)`,
        `repeating-linear-gradient(90deg, ${lineB} 0 40px, transparent 40px 80px)`,
      ].join(', '),
      backgroundBlendMode: 'multiply' as const,
    };
  }, [theme.bgBase, theme.bgLineA, theme.bgLineB]);

  return (
    <div className="min-h-screen w-full p-4 md:p-6" style={backgroundStyle}>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <Header
          date={date}
          onDateChange={setDate}
          editMode={editMode}
          onToggleEditMode={() => setEditMode((v) => !v)}
          weather={weather}
          theme={theme}
          onThemeChange={setTheme}
        />

        <main className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* 좌측 */}
          <div className="flex flex-col gap-5">
            <SectionCard
              meta={theme.sections.attendance}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, attendance: m } }))}
              editMode={editMode}
            >
              <AttendanceWidget
                attendance={dayData.attendance}
                onChange={(attendance) => setDayData((prev) => ({ ...prev, attendance }))}
              />
            </SectionCard>

            <SectionCard
              meta={theme.sections.dailyMessage}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, dailyMessage: m } }))}
              editMode={editMode}
            >
              <DailyMessageWidget
                text={dayData.dailyMessage.text}
                onChange={(text) => setDayData((prev) => ({ ...prev, dailyMessage: { text } }))}
                editMode={editMode}
              />
            </SectionCard>
          </div>

          {/* 중앙 */}
          <div className="flex flex-col gap-5">
            <SectionCard
              meta={theme.sections.activities}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, activities: m } }))}
              editMode={editMode}
            >
              <ActivityTimeline
                items={dayData.activities.items}
                onChange={(items) => setDayData((prev) => ({ ...prev, activities: { items } }))}
                editMode={editMode}
              />
            </SectionCard>

            <SectionCard
              meta={theme.sections.promises}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, promises: m } }))}
              editMode={editMode}
            >
              <PromisesWidget
                items={dayData.promises.items}
                onChange={(items) => setDayData((prev) => ({ ...prev, promises: { items } }))}
                editMode={editMode}
              />
            </SectionCard>
          </div>

          {/* 우측 */}
          <div className="flex flex-col gap-5">
            <SectionCard
              meta={theme.sections.roles}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, roles: m } }))}
              editMode={editMode}
            >
              <RolesWidget
                roles={dayData.roles}
                onChange={(roles) => setDayData((prev) => ({ ...prev, roles }))}
                editMode={editMode}
              />
            </SectionCard>

            <SectionCard
              meta={theme.sections.meal}
              onMetaChange={(m) => setTheme((prev) => ({ ...prev, sections: { ...prev.sections, meal: m } }))}
              editMode={editMode}
            >
              <MealTrayWidget
                meal={dayData.meal}
                onChange={(meal) => setDayData((prev) => ({ ...prev, meal }))}
                editMode={editMode}
                date={date}
              />
            </SectionCard>
          </div>
        </main>
      </div>
    </div>
  );
}
