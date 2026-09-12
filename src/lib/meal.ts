import { MealTray } from '../types';

export interface MealApiResult {
  requestedDate: string;
  actualDate: string;
  isSubstitute: boolean;
  note?: string;
  items: string[];
  tray: MealTray;
}

export async function fetchMealFromNeis(date: string): Promise<MealApiResult> {
  const res = await fetch(`/api/meal?date=${encodeURIComponent(date)}`);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || '급식 정보를 불러오지 못했습니다.');
  }
  return data as MealApiResult;
}
