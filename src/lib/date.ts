const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

export function formatKorean(key: string): string {
  const d = fromDateKey(key);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS_KO[d.getDay()]}요일`;
}

export function isWeekend(key: string): boolean {
  const day = fromDateKey(key).getDay();
  return day === 0 || day === 6;
}

export function todayKey(): string {
  return toDateKey(new Date());
}
