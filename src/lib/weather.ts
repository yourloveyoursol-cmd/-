// Open-Meteo(무료, API 키 불필요)로 날씨/미세먼지 조회. 실패 시 데모 데이터로 대체.

export interface WeatherInfo {
  emoji: string;
  description: string;
  temp: number;
  pm10: number | null;
  pm10Grade: string;
  pm25: number | null;
  pm25Grade: string;
  isDemo: boolean;
}

const WEATHER_CODE_MAP: Record<number, { emoji: string; description: string }> = {
  0: { emoji: '☀️', description: '맑음' },
  1: { emoji: '🌤️', description: '대체로 맑음' },
  2: { emoji: '⛅', description: '구름 조금' },
  3: { emoji: '☁️', description: '흐림' },
  45: { emoji: '🌫️', description: '안개' },
  48: { emoji: '🌫️', description: '안개' },
  51: { emoji: '🌦️', description: '이슬비' },
  53: { emoji: '🌦️', description: '이슬비' },
  55: { emoji: '🌦️', description: '이슬비' },
  61: { emoji: '🌧️', description: '비' },
  63: { emoji: '🌧️', description: '비' },
  65: { emoji: '🌧️', description: '강한 비' },
  71: { emoji: '🌨️', description: '눈' },
  73: { emoji: '🌨️', description: '눈' },
  75: { emoji: '❄️', description: '많은 눈' },
  80: { emoji: '🌦️', description: '소나기' },
  81: { emoji: '🌦️', description: '소나기' },
  82: { emoji: '⛈️', description: '강한 소나기' },
  95: { emoji: '⛈️', description: '뇌우' },
  96: { emoji: '⛈️', description: '뇌우' },
  99: { emoji: '⛈️', description: '뇌우' },
};

function gradePm10(value: number): string {
  if (value <= 30) return '좋음';
  if (value <= 80) return '보통';
  if (value <= 150) return '나쁨';
  return '매우나쁨';
}

function gradePm25(value: number): string {
  if (value <= 15) return '좋음';
  if (value <= 35) return '보통';
  if (value <= 75) return '나쁨';
  return '매우나쁨';
}

export const DEMO_WEATHER: WeatherInfo = {
  emoji: '🌤️',
  description: '대체로 맑음',
  temp: 22,
  pm10: 28,
  pm10Grade: '좋음',
  pm25: 12,
  pm25Grade: '좋음',
  isDemo: true,
};

// 기본 위치: 경기도 시흥시
const DEFAULT_LAT = 37.3801;
const DEFAULT_LON = 126.8025;

export async function fetchWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherInfo> {
  try {
    const [weatherRes, airRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&timezone=auto`),
    ]);
    if (!weatherRes.ok) throw new Error('weather fetch failed');
    const weatherData = await weatherRes.json();
    const code = weatherData?.current?.weather_code;
    const temp = weatherData?.current?.temperature_2m;
    const mapped = WEATHER_CODE_MAP[code] ?? { emoji: '🌤️', description: '알 수 없음' };

    let pm10: number | null = null;
    let pm25: number | null = null;
    if (airRes.ok) {
      const airData = await airRes.json();
      pm10 = airData?.current?.pm10 ?? null;
      pm25 = airData?.current?.pm2_5 ?? null;
    }

    if (typeof temp !== 'number') throw new Error('no temperature');

    return {
      emoji: mapped.emoji,
      description: mapped.description,
      temp: Math.round(temp),
      pm10: pm10 !== null ? Math.round(pm10) : null,
      pm10Grade: pm10 !== null ? gradePm10(pm10) : '정보없음',
      pm25: pm25 !== null ? Math.round(pm25) : null,
      pm25Grade: pm25 !== null ? gradePm25(pm25) : '정보없음',
      isDemo: false,
    };
  } catch (e) {
    console.warn('날씨 조회 실패, 데모 데이터로 대체합니다.', e);
    return DEMO_WEATHER;
  }
}
