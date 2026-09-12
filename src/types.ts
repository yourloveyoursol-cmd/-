// --- 공용 타입 정의 ---

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export function hslToCss({ h, s, l }: HSL, alpha = 1): string {
  return alpha >= 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${alpha})`;
}

export interface SectionMeta {
  emoji: string;
  title: string;
  visible: boolean;
  titleColor: HSL;
}

export type SectionKey =
  | 'attendance'
  | 'dailyMessage'
  | 'activities'
  | 'promises'
  | 'roles'
  | 'meal';

export interface ThemeSettings {
  bgBase: HSL;
  bgLineA: HSL; // gingham 체크 색상 1 (하늘색 계열)
  bgLineB: HSL; // gingham 체크 색상 2 (핑크 계열)
  pointColor: HSL; // 버튼/포인트 색상
  sections: Record<SectionKey, SectionMeta>;
}

export interface RoleAssignment {
  id: string;
  role: string;
  child: string;
}

export interface PromiseItem {
  text: string;
  checked: boolean;
}

export interface MealTray {
  rice: string;
  soup: string;
  sides: string[]; // 최대 4칸
}

export interface MealState {
  rawInput: string;
  tray: MealTray;
  source: 'manual' | 'neis';
  fetchedDate?: string; // 실제로 데이터를 가져온 날짜 (대체 표시용)
  isSubstitute?: boolean;
  note?: string;
  updatedAt?: string;
}

export interface DayData {
  date: string;
  attendance: { total: number; present: number; absent: number };
  dailyMessage: { text: string };
  activities: { items: string[] };
  promises: { items: PromiseItem[] };
  roles: RoleAssignment[];
  meal: MealState;
}

export const DEFAULT_ROLE_TEMPLATE: string[] = ['우유 당번', '줄서기 대장', '정리 도우미'];

export function createEmptyDayData(date: string): DayData {
  return {
    date,
    attendance: { total: 0, present: 0, absent: 0 },
    dailyMessage: { text: '' },
    activities: { items: ['아침모임', '자유놀이', '이야기 나누기', '점심시간', '바깥놀이', '귀가 준비'] },
    promises: { items: [{ text: '친구와 사이좋게 지내요', checked: false }, { text: '차례를 지켜요', checked: false }] },
    roles: DEFAULT_ROLE_TEMPLATE.map((role, i) => ({ id: `role-${i}`, role, child: '' })),
    meal: {
      rawInput: '',
      tray: { rice: '', soup: '', sides: ['', '', '', ''] },
      source: 'manual',
    },
  };
}

export const DEFAULT_THEME: ThemeSettings = {
  bgBase: { h: 45, s: 60, l: 97 },
  bgLineA: { h: 193, s: 55, l: 85 },
  bgLineB: { h: 331, s: 70, l: 85 },
  pointColor: { h: 331, s: 65, l: 68 },
  sections: {
    attendance: { emoji: '🧑‍🤝‍🧑', title: '출석 현황', visible: true, titleColor: { h: 200, s: 60, l: 45 } },
    dailyMessage: { emoji: '💌', title: '하루 한마디', visible: true, titleColor: { h: 331, s: 65, l: 55 } },
    activities: { emoji: '🎨', title: '오늘의 활동', visible: true, titleColor: { h: 28, s: 80, l: 50 } },
    promises: { emoji: '❤️', title: '오늘의 약속', visible: true, titleColor: { h: 350, s: 70, l: 55 } },
    roles: { emoji: '🙌', title: '오늘의 역할', visible: true, titleColor: { h: 140, s: 40, l: 38 } },
    meal: { emoji: '🍽️', title: '오늘의 급식', visible: true, titleColor: { h: 265, s: 45, l: 55 } },
  },
};

export const EMOJI_PRESETS: string[] = [
  '🎨', '🧩', '📚', '✏️', '🖍️', '🧸', '⚽', '🎵', '🎤', '🧑‍🤝‍🧑',
  '❤️', '💌', '⭐', '🌟', '🌈', '☀️', '🌧️', '❄️', '🍎', '🍌',
  '🥛', '🍚', '🍲', '🍽️', '🙌', '👏', '🚌', '🔔', '📣', '🧴',
  '🪥', '🧹', '🚸', '🧺', '📌', '🎈', '🎉', '🐣', '🐥', '🐻',
];
