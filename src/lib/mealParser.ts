import { MealTray } from '../types';

const RICE_KEYWORDS = ['밥', '덮밥', '볶음밥', '비빔밥', '주먹밥', '죽', '리조또', '카레라이스'];
const SOUP_KEYWORDS = ['국', '찌개', '탕', '전골', '스프', '수프', '육개장'];
const EXTRA_KEYWORDS = ['우유', '요구르트', '요플레', '치즈', '과일', '바나나', '사과', '귤', '포도', '수박', '참외', '딸기', '토마토', '디저트', '주스', '아이스크림', '푸딩', '음료', '자몽'];

// 나이스/식단표 원문에서 칼로리·알레르기 코드·불필요한 기호를 제거하고 순수 음식명만 추출
export function cleanFoodName(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\([^)]*\)/g, '') // (5.6.16) 같은 알레르기 표기 제거
    .replace(/\d+(\.\d+)?\s*kcal/gi, '')
    .replace(/[*&#]/g, '')
    .replace(/[0-9]+(\.[0-9]+)*\.?/g, '') // 번호 표기(1.2.5.) 제거
    .trim();
}

export function splitMenuLines(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((line) => cleanFoodName(line))
    .filter((line) => line.length > 0);
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

// 음식명 목록을 6구 식판(반찬 4, 밥 1, 국 1)에 맞게 자동 분류
export function classifyToTray(items: string[]): MealTray {
  const tray: MealTray = { rice: '', soup: '', sides: [] };
  const remaining: string[] = [];

  for (const item of items) {
    if (!tray.rice && includesAny(item, RICE_KEYWORDS)) {
      tray.rice = item;
    } else if (!tray.soup && includesAny(item, SOUP_KEYWORDS)) {
      tray.soup = item;
    } else {
      remaining.push(item);
    }
  }

  // 반찬 우선순위: 일반 반찬을 앞쪽 칸에, 우유/과일/디저트류는 뒤쪽 칸으로
  const mainSides = remaining.filter((i) => !includesAny(i, EXTRA_KEYWORDS));
  const extraSides = remaining.filter((i) => includesAny(i, EXTRA_KEYWORDS));
  const ordered = [...mainSides, ...extraSides];

  const sides = ordered.slice(0, 4);
  const overflow = ordered.slice(4);
  if (overflow.length > 0 && sides.length > 0) {
    sides[sides.length - 1] = `${sides[sides.length - 1]}, ${overflow.join(', ')}`;
  } else if (overflow.length > 0) {
    sides.push(overflow.join(', '));
  }
  while (sides.length < 4) sides.push('');
  tray.sides = sides;

  return tray;
}
