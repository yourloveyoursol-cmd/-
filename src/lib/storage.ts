import { useCallback, useEffect, useState } from 'react';
import { DayData, ThemeSettings, DEFAULT_THEME, createEmptyDayData } from '../types';

const SETTINGS_KEY = 'kmb.settings.v1';
const dayKey = (date: string) => `kmb.day.${date}.v1`;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage 저장 실패', e);
  }
}

function mergeTheme(stored: Partial<ThemeSettings> | null): ThemeSettings {
  if (!stored) return DEFAULT_THEME;
  const mergedSections = { ...DEFAULT_THEME.sections };
  for (const key of Object.keys(mergedSections) as (keyof typeof mergedSections)[]) {
    mergedSections[key] = { ...mergedSections[key], ...(stored.sections?.[key] || {}) };
  }
  return {
    ...DEFAULT_THEME,
    ...stored,
    sections: mergedSections,
  };
}

export function useTheme(): [ThemeSettings, (updater: (prev: ThemeSettings) => ThemeSettings) => void] {
  const [theme, setThemeState] = useState<ThemeSettings>(() => mergeTheme(readJson<ThemeSettings>(SETTINGS_KEY)));

  useEffect(() => {
    writeJson(SETTINGS_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((updater: (prev: ThemeSettings) => ThemeSettings) => {
    setThemeState((prev) => updater(prev));
  }, []);

  return [theme, setTheme];
}

function mergeDayData(date: string, stored: Partial<DayData> | null): DayData {
  const empty = createEmptyDayData(date);
  if (!stored) return empty;
  return {
    ...empty,
    ...stored,
    attendance: { ...empty.attendance, ...(stored.attendance || {}) },
    dailyMessage: { ...empty.dailyMessage, ...(stored.dailyMessage || {}) },
    activities: { ...empty.activities, ...(stored.activities || {}) },
    promises: { ...empty.promises, ...(stored.promises || {}) },
    roles: stored.roles && stored.roles.length > 0 ? stored.roles : empty.roles,
    meal: { ...empty.meal, ...(stored.meal || {}), tray: { ...empty.meal.tray, ...(stored.meal?.tray || {}) } },
  };
}

export function useDayData(date: string): [DayData, (updater: (prev: DayData) => DayData) => void] {
  const [data, setData] = useState<DayData>(() => mergeDayData(date, readJson<DayData>(dayKey(date))));

  useEffect(() => {
    setData(mergeDayData(date, readJson<DayData>(dayKey(date))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    writeJson(dayKey(date), data);
  }, [date, data]);

  const updateData = useCallback((updater: (prev: DayData) => DayData) => {
    setData((prev) => updater(prev));
  }, []);

  return [data, updateData];
}
