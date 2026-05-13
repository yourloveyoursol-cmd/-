import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Sun, Cloud, CloudRain, Droplets, Wind, 
  Smile, Frown, Meh, Heart, Zap, Ghost, Angry, Star, Coffee,
  Plus, Trash2, Edit2, Play, User, MessageCircle, HelpCircle, Lightbulb,
  Utensils, Trophy, ShieldCheck, Upload, FileText,
  Settings, X, RotateCw, Sparkles, Camera, Save, History, CheckCircle2,
  Image as ImageIcon, Loader2, Type, Database, Zap as ZapIcon, ClipboardList,
  HandMetal, MousePointer2, Download, UserPlus, Check, Navigation, RefreshCw,
  AlertTriangle, Siren, CloudSnow, MapPin, CloudSun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- 전역 설정: 감정 데이터 ---
const EMOTIONS_DATA = [
  { name: '행복해요', icon: <Smile className="text-yellow-400" size={48} />, color: 'bg-yellow-50', borderColor: 'border-yellow-200', category: 'positive' },
  { name: '사랑스러워요', icon: <Heart className="text-pink-400" size={48} />, color: 'bg-pink-50', borderColor: 'border-pink-200', category: 'positive' },
  { name: '뿌듯해요', icon: <Star className="text-yellow-500" size={48} />, color: 'bg-amber-100', borderColor: 'border-amber-200', category: 'positive' },
  { name: '편안해요', icon: <Droplets className="text-blue-400" size={48} />, color: 'bg-blue-50', borderColor: 'border-blue-200', category: 'negative' },
  { name: '가벼워요', icon: <Wind className="text-teal-400" size={48} />, color: 'bg-teal-50', borderColor: 'border-teal-200', category: 'negative' },
  { name: '휴식이 필요해요', icon: <Coffee className="text-stone-500" size={48} />, color: 'bg-stone-50', borderColor: 'border-stone-200', category: 'negative' },
  { name: '속상해요', icon: <Frown className="text-blue-400" size={48} />, color: 'bg-blue-50', borderColor: 'border-blue-200', category: 'neutral' },
  { name: '화나요', icon: <Angry className="text-red-400" size={48} />, color: 'bg-red-50', borderColor: 'border-red-200', category: 'neutral' },
  { name: '불안해요', icon: <Ghost className="text-purple-400" size={48} />, color: 'bg-purple-50', borderColor: 'border-purple-200', category: 'neutral' },
];

const INITIAL_AFFIRMATIONS: Record<string, { title: string, items: string[] }> = {
  care: {
    title: "배려",
    items: [
      "나는 친구 말을 잘 들어주는 마음이 따뜻한 어린이에요.",
      "나는 친구와 사이좋게 지내는 착한 어린이에요.",
      "나는 친구의 마음을 먼저 물어봐 주는 다정한 어린이에요.",
      "나는 친구에게 예쁜 말을 하는 고운 어린이에요."
    ]
  },
  effort: {
    title: "질서",
    items: [
      "나는 약속을 꼭 지키는 믿음직한 어린이에요.",
      "나는 차례를 잘 기다리는 참을성 있는 어린이에요.",
      "나는 스스로 정리하는 부지런한 어린이에요.",
      "나는 마음을 차분히 하는 씩씩한 어린이에요."
    ]
  },
  challenge: {
    title: "도전",
    items: [
      "나는 포기하지 않고 끝까지 노력하는 어린이에요.",
      "나는 다시 한번 도전하는 용기 있는 어린이에요.",
      "나는 실수를 통해 생각을 쑥쑥 키우는 어린이에요.",
      "나는 할 수 있다고 믿는 자신감 있는 어린이에요."
    ]
  },
  love: {
    title: "사랑",
    items: [
      "나는 나를 많이 아끼고 사랑하는 어린이에요.",
      "나는 매일 밝게 웃는 행복한 어린이에요.",
      "나는 스스로 해내는 내가 자랑스러운 어린이에요.",
      "나는 날마다 몸도 마음도 멋지게 자라는 어린이에요."
    ]
  }
};

const CATEGORY_NAMES: Record<string, string> = {
  positive: '내 마음이 햇살처럼 빛나요! ☀️',
  negative: '내 마음이 호수처럼 평안해요 🌊',
  neutral: '도움이 필요해요 🚨'
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  positive: <Smile className="text-yellow-400" />,
  negative: <Droplets className="text-blue-400" />,
  neutral: <Siren className="text-red-500 animate-pulse" />
};

interface Student {
  id: string;
  name: string;
  photo: string | null;
}

interface Challenge {
  id: number;
  title: string;
  participants: Student[];
  date: string;
}

const App = () => {
  // --- 상태 관리 ---
  const [currentStep, setCurrentStep] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyEmotions, setDailyEmotions] = useState<Record<string, number>>({});
  const [activities, setActivities] = useState<string[]>([
    "아침모임", "그림책 읽기", "빙고게임", "놀이", "점심시간", "양치", "해가람시간"
  ]);
  const [lunchMenu, setLunchMenu] = useState("");
  const [rawMealText, setRawMealText] = useState(""); 
  const [playAnswers, setPlayAnswers] = useState<Record<string, string>>({});
  const [playRecords, setPlayRecords] = useState<any[]>([]);
  const [playQuestions, setPlayQuestions] = useState<{id: string, label: string}[]>([
    { id: 'title', label: '어떤 놀이를 했나요?' },
    { id: 'partners', label: '함께한 친구?' },
    { id: 'bestMoment', label: '재미있던 순간?' },
    { id: 'hardMoment', label: '어려웠던 순간?' },
    { id: 'ideas', label: '놀이 아이디어!' },
    { id: 'interested', label: '참여하고 싶은 친구' }
  ]);
  const [interestedFriends, setInterestedFriends] = useState<Student[]>([]);
  const [weather, setWeather] = useState({ 
    status: '연결중', 
    temp: '--', 
    tempDiff: '--', 
    rain: '--', 
    pm10: '--', 
    pm10Status: '정보없음',
    pm25: '--',
    pm25Status: '정보없음',
    uv: '--',
    sunset: '--',
    location: '위치 확인 중',
    humidity: '--',
    wind: '--',
    lastUpdated: '--',
    sources: [] as { title: string, uri: string }[]
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [newChallengeTitle, setNewChallengeTitle] = useState("");
  const [currentChallengeParticipants, setCurrentChallengeParticipants] = useState<Student[]>([]);
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);

  const [affirmations, setAffirmations] = useState<Record<string, { title: string, items: string[] }>>(INITIAL_AFFIRMATIONS);
  const [selectedAffirmation, setSelectedAffirmation] = useState<{ category: string, text: string } | null>(null);
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);

  useEffect(() => {
    if (currentStep === 3) {
      setIsPickModalOpen(true);
    }
  }, [currentStep]);
  const [settingsTab, setSettingsTab] = useState<'students' | 'lunch' | 'affirmations'>('students');

  const [editingActivityIdx, setEditingActivityIdx] = useState<number | 'new' | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | 'new' | null>(null);
  const [editValue, setEditValue] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [libLoaded, setLibLoaded] = useState({ xlsx: false, pdf: false, jszip: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pickHistory, setPickHistory] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEmotionIndex, setSelectedEmotionIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['positive', 'negative', 'neutral']);

  const draggingStudentId = useRef<string | null>(null);
  const draggingActivityIdx = useRef<number | null>(null);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayDay = now.getDate(); 
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();

  // --- IndexedDB 설정 ---
  const DB_NAME = "Hb2MorningMeeting_V20";
  const STORE_NAME = "appData";

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  };

  const saveData = async (key: string, val: any) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(val, key);
    } catch (e) { console.error("Save Error", e); }
  };

  const getData = async (key: string): Promise<any> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch (e) { return null; }
  };

  // --- 경기도 시흥시 실시간 날씨 데이터 연동 ---
  const fetchRealWeather = () => {
    setWeather(prev => ({ ...prev, status: '시흥 날씨 확인중' }));
    const lat = 37.3801;
    const lon = 126.8025;

    const getWeatherData = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability`);
        const data = await res.json();
        const cw = data.current_weather;
        
        const codeMap: Record<number, string> = {
          0: '맑음', 1: '대체로 맑음', 2: '구름조금', 3: '흐림',
          45: '안개', 48: '안개', 51: '이슬비', 61: '비',
          71: '눈', 95: '뇌우'
        };

        const currentHour = new Date().getHours();
        
        setWeather({
          status: codeMap[cw.weathercode] || '맑음',
          temp: Math.round(cw.temperature).toString(),
          rain: (data.hourly.precipitation_probability[currentHour] || 0).toString(),
          humidity: (data.hourly.relativehumidity_2m[currentHour] || 0).toString(),
          wind: cw.windspeed.toString()
        });
      } catch (err) {
        setWeather({ status: '연결끊김', temp: '!', rain: '!', humidity: '!', wind: '!' });
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => getWeatherData(position.coords.latitude, position.coords.longitude),
        () => getWeatherData(lat, lon),
        { timeout: 5000 }
      );
    } else {
      getWeatherData(lat, lon);
    }
  };

  // --- 구글 검색을 통한 날씨 데이터 연동 (사용자 요청 2단계 패턴) ---
  const fetchWeatherWithSearch = async (force = false) => {
    if (!force) {
      const cached = await getData("cachedWeather");
      if (cached && cached.data && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        setWeather(cached.data);
        setLastUpdated(new Date(cached.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        return;
      }
    }

    if (isWeatherLoading) return;
    setIsWeatherLoading(true);
    setWeatherError(null);
    setWeather(prev => ({ ...prev, status: '날씨 불러오는 중...' }));
    
    const getCoords = (): Promise<{lat: number, lon: number}> => {
      return new Promise((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve({ lat: 37.368, lon: 126.804 }), // 시흥시 장현동 거부 시 기본값
            { timeout: 5000 }
          );
        } else {
          resolve({ lat: 37.368, lon: 126.804 });
        }
      });
    };

    try {
      const { lat, lon } = await getCoords();
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // 1. Get the location name from coordinates
      const locationRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `내 좌표는 위도(lat): ${lat}, 경도(lon): ${lon} 이야. 이 좌표에 해당하는 한국의 '동' 단위 주소(예: 서울시 강남구 역삼동)를 알려줘. 다른 설명 없이 주소만 딱 말해줘.`,
      });
      const locationName = locationRes.text.trim() || "시흥시 장현동";

      // 2. Fetch Naver weather for this specifically identified location
      const response = await fetch(`/api/weather/naver?location=${encodeURIComponent(locationName)}`);
      if (!response.ok) throw new Error("Naver API connection failed");
      const serverData = await response.json();

      // 3. Extract the detailed weather data from Naver results using Gemini
      const jsonResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `다음 네이버 검색 결과 텍스트에서 날씨 정보를 추출해서 JSON으로 변환해줘. 숫자는 문자열로 포함하고 등급도 포함해줘. 주소는 반드시 "${locationName}" 으로 설정해줘:
        {
          "temperature": "22",
          "condition": "맑음",
          "location": "${locationName}",
          "tempDiff": "어제보다 1° 높아요",
          "humidity": "45%",
          "wind": "2.5m/s",
          "rain": "10%",
          "pm10": "25",
          "pm10Status": "좋음",
          "pm25": "12",
          "pm25Status": "좋음",
          "uv": "좋음",
          "sunset": "19:24"
        }
        데이터: ${serverData.rawText}`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(jsonResponse?.text || "{}");

      if (data.temperature) {
        const newWeather = {
          status: data.condition || "정보없음",
          temp: data.temperature,
          tempDiff: data.tempDiff || "--",
          rain: data.rain || "--",
          pm10: data.pm10 || "--",
          pm10Status: data.pm10Status || "정보없음",
          pm25: data.pm25 || "--",
          pm25Status: data.pm25Status || "정보없음",
          uv: data.uv || "보통",
          sunset: data.sunset || "19:35",
          location: data.location || locationName,
          humidity: data.humidity || "--",
          wind: data.wind || "--",
          lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          sources: [{ title: "Naver Weather Direct", uri: "https://weather.naver.com" }]
        };
        setWeather(newWeather);
        const now = Date.now();
        setLastUpdated(new Date(now).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        saveData("cachedWeather", { data: newWeather, timestamp: now });
      }
    } catch (err: any) {
      console.error(err);
      setWeatherError("네이버 API 연결에 실패했습니다. 프록시 서버 상태를 확인해주세요.");
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // --- 단계 변경 시 처리 ---
  useEffect(() => {
    if (currentStep === 3) {
      setIsPickModalOpen(true);
    }
  }, [currentStep]);

  // --- 실시간 시계 업데이트 ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 초기 데이터 로드 ---
  useEffect(() => {
    fetchWeatherWithSearch();
    const scripts = [
      { id: 'xlsx', src: "https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js" },
      { id: 'pdf', src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" },
      { id: 'jszip', src: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" }
    ];
    scripts.forEach(s => {
      if (document.getElementById(`script-${s.id}`)) return;
      const script = document.createElement('script');
      script.id = `script-${s.id}`;
      script.src = s.src;
      script.onload = () => {
        if (s.id === 'pdf') (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setLibLoaded(prev => ({ ...prev, [s.id]: true }));
      };
      document.head.appendChild(script);
    });

    const loadAllData = async () => {
      const s = await getData("students"); if (s) setStudents(s);
      const e = await getData("dailyEmotions"); if (e) setDailyEmotions(e);
      const c = await getData("challenges"); if (c) setChallenges(c);
      const play = await getData("playAnswers"); if (play) setPlayAnswers(play);
      const records = await getData("playRecords"); if (records) setPlayRecords(records || []);
      const questions = await getData("playQuestions"); if (questions) setPlayQuestions(questions);
      const interested = await getData("interestedFriends"); if (interested) setInterestedFriends(interested);
      const history = await getData("pickHistory"); if (history) setPickHistory(history);
      const lunch = await getData("lunchMenu"); if (lunch) setLunchMenu(lunch);
      const raw = await getData("rawMealText"); if (raw) setRawMealText(raw);
    };
    loadAllData();
  }, [today]);

  useEffect(() => { saveData("students", students); }, [students]);
  useEffect(() => { saveData("dailyEmotions", dailyEmotions); }, [dailyEmotions]);
  useEffect(() => { saveData("challenges", challenges); }, [challenges]);
  useEffect(() => { saveData("activities", activities); }, [activities]);
  useEffect(() => { saveData("lunchMenu", lunchMenu); }, [lunchMenu]);
  useEffect(() => { saveData("rawMealText", rawMealText); }, [rawMealText]);
  useEffect(() => { saveData("playAnswers", playAnswers); }, [playAnswers]);
  useEffect(() => { saveData("playRecords", playRecords); }, [playRecords]);
  useEffect(() => { saveData("playQuestions", playQuestions); }, [playQuestions]);
  useEffect(() => { saveData("interestedFriends", interestedFriends); }, [interestedFriends]);
  useEffect(() => { saveData("pickHistory", pickHistory); }, [pickHistory]);

  // --- 핵심 기능 함수 ---
  const cleanMealText = (text: string) => {
    if (!text) return "";
    return text.replace(/\([^)]*\)/g, "").replace(/[0-9.]/g, "").replace(/[*&]/g, " ").replace(/에너지|단백질|칼슘|철|kcal/g, "").split(/[\s,:]+/).map(s => s.trim()).filter(s => s.length > 1 && !s.includes("월") && !s.includes("일")).join("\n");
  };

  const processMealText = (raw: string) => {
    if (!raw) return;
    const lines = raw.split('\n');
    const searchPattern = `${todayMonth}월 ${todayDay}일`;
    const todayLine = lines.find(line => line.includes(searchPattern));
    if (todayLine) {
      const menuPart = todayLine.split(/[:)]/).pop() || "";
      setLunchMenu(cleanMealText(menuPart));
      alert("오늘의 식단을 불러왔습니다!");
    } else {
      setLunchMenu(cleanMealText(raw));
      alert("날짜를 찾지 못해 전체 내용을 정리했습니다.");
    }
  };

  const onDragStart = (id: string) => { draggingStudentId.current = id; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  
  const onDropEmotion = (idx: number) => {
    const sid = draggingStudentId.current;
    if (sid) { 
      setDailyEmotions(prev => ({ ...prev, [sid]: idx })); 
      draggingStudentId.current = null; 
    }
  };

  const onDropChallenge = () => {
    const sid = draggingStudentId.current;
    if (sid) {
      const student = students.find(s => s.id === sid);
      if (student && !currentChallengeParticipants.some(p => p.id === sid)) {
        setCurrentChallengeParticipants(prev => [...prev, student]);
      }
      draggingStudentId.current = null;
    }
  };

  const pickRandomStudent = () => {
    if (students.length === 0) return;
    
    // 현재 기록 저장 (만약 내용이 있다면)
    if (selectedStudent && (Object.values(playAnswers) as string[]).some(v => v.trim() !== "")) {
      const newRecord = {
        id: Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        answers: { ...playAnswers },
        date: new Date().toLocaleString()
      };
      setPlayRecords(prev => [newRecord, ...prev]);
      setPlayAnswers({}); // 새 뽑기를 위해 초기화
    } else if (selectedStudent) {
      // 내용이 없더라도 학생이 선택되어 있었다면 초기화만 진행
      setPlayAnswers({});
    }

    // Filter out students who have been picked recently
    let availableStudents = students.filter(s => !pickHistory.includes(s.id));
    
    // If everyone has been picked, reset history
    if (availableStudents.length === 0) {
      availableStudents = [...students];
      setPickHistory([]);
    }

    setIsSpinning(true); 
    setSelectedStudent(null);
    
    let count = 0;
    const interval = setInterval(() => {
      try {
        if (availableStudents.length === 0) {
          clearInterval(interval);
          setIsSpinning(false);
          return;
        }
        const tempStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
        if (!tempStudent) return;
        
        setSelectedStudent(tempStudent);
        count++;
        if (count > 20) { 
          clearInterval(interval); 
          setIsSpinning(false); 
          if (tempStudent) {
            setPickHistory(prev => [...prev, tempStudent.id]);
          }
        }
      } catch (err) {
        console.error("Pick Error:", err);
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const downloadPlayTxt = () => {
    let content = `[햇빛2반 오늘의 놀이 기록 - ${todayYear}년 ${todayMonth}월 ${todayDay}일]\n\n`;
    
    content = content + `■ 현재 진행 중인 기록\n`;
    const pickedNames = pickHistory.map(id => students.find(s => s.id === id)?.name).filter(Boolean).join(', ');
    content += `발표자 명단: ${pickedNames || '미지정'}\n`;
    content += `현재 발표자: ${selectedStudent?.name || '미지정'}\n`;
    content += `---------------------------------\n`;
    
    playQuestions.forEach(q => {
      content += `${q.label}: ${playAnswers[q.id] || '(내용 없음)'}\n`;
    });
    
    if (playRecords.length > 0) {
      content += `\n\n■ 이전 기록 (히스토리)\n`;
      content += `=================================\n`;
      playRecords.forEach((record, idx) => {
        content += `[기록 ${idx + 1}] ${record.date} - ${record.studentName}\n`;
        playQuestions.forEach(q => {
          content += `- ${q.label}: ${record.answers[q.id] || '(내용 없음)'}\n`;
        });
        content += `---------------------------------\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${today}_놀이기록_전체.txt`;
    a.click();
  };

  const downloadChallengeTxt = () => {
    const dailyChallenges = challenges.filter(c => c.date === today);
    let content = `[햇빛2반 오늘의 도전 기록 - ${todayYear}년 ${todayMonth}월 ${todayDay}일]\n\n`;
    dailyChallenges.forEach((c, idx) => {
      content += `${idx + 1}. 도전: ${c.title}\n   도전자: ${c.participants.map(p => p.name).join(', ')}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${today}_도전기록.txt`;
    a.click();
  };

  const handleAddChallenge = () => {
    if (!newChallengeTitle || currentChallengeParticipants.length === 0) return;
    
    if (editingChallengeId) {
      setChallenges(prev => prev.map(c => 
        c.id === editingChallengeId 
          ? { ...c, title: newChallengeTitle, participants: [...currentChallengeParticipants] }
          : c
      ));
      setEditingChallengeId(null);
    } else {
      const newEntry: Challenge = { id: Date.now(), title: newChallengeTitle, participants: [...currentChallengeParticipants], date: today };
      setChallenges(prev => [newEntry, ...prev]);
    }
    
    setNewChallengeTitle("");
    setCurrentChallengeParticipants([]);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !(window as any).JSZip || !(window as any).XLSX) return;
    setIsProcessing(true);
    try {
      const XLSX = (window as any).XLSX;
      const JSZip = (window as any).JSZip;
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      const zip = await JSZip.loadAsync(file);
      const mediaFiles: Record<string, string> = {};
      for (const [path, entry] of Object.entries(zip.files)) {
        if (path.startsWith('xl/media/')) {
          const blob = await (entry as any).async('blob');
          mediaFiles[path.replace('xl/media/', '../media/')] = await new Promise(res => {
            const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob);
          });
        }
      }
      const drawingMap: Record<number, string> = {};
      const zipDrawingFile = zip.file("xl/drawings/drawing1.xml");
      if (zipDrawingFile) {
        const drDoc = new DOMParser().parseFromString(await zipDrawingFile.async("string"), "application/xml");
        const relsDoc = new DOMParser().parseFromString(await zip.file("xl/drawings/_rels/drawing1.xml.rels")!.async("string"), "application/xml");
        const relsMap: Record<string, string> = {};
        relsDoc.querySelectorAll("Relationship").forEach(r => relsMap[r.getAttribute("Id")!] = r.getAttribute("Target")!);
        drDoc.querySelectorAll("twoCellAnchor, oneCellAnchor").forEach(anchor => {
          const fromCol = parseInt(anchor.querySelector("from col")?.textContent || "-1");
          const fromRow = parseInt(anchor.querySelector("from row")?.textContent || "-1");
          const rId = anchor.querySelector("blip")?.getAttribute("r:embed");
          if (fromCol === 1 && rId && relsMap[rId]) drawingMap[fromRow] = mediaFiles[relsMap[rId]];
        });
      }
      const newList: Student[] = rows.slice(1).map((row, idx) => {
        if (!row[0]) return null;
        return { id: `std-${Date.now()}-${idx}`, name: String(row[0]).trim(), photo: drawingMap[idx + 1] || null };
      }).filter((s): s is Student => s !== null);
      setStudents(newList);
      alert("명단 등록 완료!");
    } catch (err) { alert("업로드 실패"); }
    setIsProcessing(false);
  };

  const getDustInfo = (status: string) => {
    const s = status || "";
    if (s.includes('좋음') || s.includes('최고')) return { emoji: '🌈', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (s.includes('보통')) return { emoji: '☀️', color: 'text-green-600', bg: 'bg-green-50' };
    if (s.includes('나쁨') && !s.includes('매우')) return { emoji: '🌫️', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (s.includes('매우나쁨') || s.includes('매우 나쁨')) return { emoji: '😷', color: 'text-red-600', bg: 'bg-red-50' };
    return { emoji: '☁️', color: 'text-gray-400', bg: 'bg-gray-50' };
  };

  const getUVStatus = (val: string) => {
    if (val.includes('낮음') || val.includes('좋음')) return { label: '좋음', emoji: '☀️', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (val.includes('보통')) return { label: '보통', emoji: '🌤️', color: 'text-green-500', bg: 'bg-green-50' };
    if (val.includes('높음')) return { label: '나쁨', emoji: '🔥', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (val.includes('매우높음') || val.includes('위험')) return { label: '매우나쁨', emoji: '🚫', color: 'text-red-500', bg: 'bg-red-50' };
    return null;
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0: return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full text-center p-4"
        >
          <div className="p-12 rounded-[5rem] relative w-full max-w-5xl">
            <h3 className="text-[13rem] font-black text-[#63C8FF] mb-6 drop-shadow-md">{todayYear}년</h3>
            <div className="flex flex-col items-center">
              <h1 className="text-[18rem] md:text-[24rem] font-black text-gray-800 leading-none tracking-tighter drop-shadow-lg whitespace-nowrap">
                {todayMonth}월 {todayDay}일 {now.toLocaleDateString('ko-KR', { weekday: 'long' })}
              </h1>
            </div>
          </div>
        </motion.div>
      );
      case 1: return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full p-4 overflow-hidden relative"
        >
          <div className="w-full max-w-[96vw] bg-white text-black rounded-[4rem] border-[10px] border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 overflow-y-auto custom-scrollbar">
            {/* 상단: 타이틀 및 위치 */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-6 bg-[#63C8FF]/10 px-10 py-6 rounded-full border-4 border-[#63C8FF]/30 shadow-md">
                <MapPin className="text-[#63C8FF]" size={60} />
                <span className="text-6xl font-black text-gray-800">{weather.location}</span>
                <span className="text-3xl font-bold text-gray-400 bg-white px-6 py-2 rounded-full border-2 border-gray-100">업데이트: {weather.lastUpdated}</span>
              </div>
              <div className="flex flex-col items-end">
                <h2 className="text-8xl font-black tracking-tighter leading-none text-gray-900">
                  {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </h2>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isWeatherLoading ? (
                <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                  <div className="w-48 h-48 border-[12px] border-[#63C8FF]/20 border-t-[#63C8FF] rounded-full animate-spin mb-12"></div>
                  <p className="text-6xl font-black text-[#63C8FF]">날씨 정보를 불러오는 중입니다...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 메인 정보 섹션 */}
                  <div className="grid grid-cols-1 gap-8">
                    {/* 큰 온도 및 상태 카드 */}
                    <div className="bg-gradient-to-br from-[#63C8FF]/5 to-white p-12 rounded-[5rem] border-[6px] border-[#63C8FF]/20 flex items-center justify-around shadow-lg relative overflow-hidden">
                      <div className="flex items-center space-x-12">
                        <div className="flex flex-col items-center">
                          {weather.status.includes('맑음') ? <Sun className="text-yellow-400 drop-shadow-xl" size={240} /> :
                           weather.status.includes('비') ? <CloudRain className="text-blue-500 drop-shadow-xl" size={240} /> :
                           <CloudSun className="text-gray-400 drop-shadow-xl" size={240} />}
                          <span className="text-7xl font-black text-gray-800 mt-4">{weather.status}</span>
                        </div>
                        
                        <div className="flex flex-col items-start">
                          <div className="flex items-baseline">
                            <span className="text-[18rem] font-black leading-none tracking-tighter text-gray-900">{weather.temp}</span>
                            <span className="text-[8rem] font-black text-gray-400 ml-4">°</span>
                          </div>
                          <div className="mt-2 bg-white px-10 py-4 rounded-full border-4 border-[#63C8FF]/30 shadow-md">
                            <span className="text-5xl font-black text-gray-800">{weather.tempDiff}</span>
                          </div>
                        </div>
                      </div>

                      {/* 공기질 요약 (메인 카드 내부에 크게 배치) */}
                      <div className="grid grid-rows-2 gap-8 min-w-[400px]">
                        <div className={`p-10 rounded-[4rem] border-[6px] border-black/5 flex items-center justify-between ${getDustInfo(weather.pm10Status).bg} shadow-xl`}>
                          <div className="flex flex-col">
                            <span className="text-4xl font-black text-gray-400 mb-2">미세먼지</span>
                            <span className={`text-7xl font-black ${getDustInfo(weather.pm10Status).color}`}>{weather.pm10Status}</span>
                          </div>
                          <span className="text-[8rem]">{getDustInfo(weather.pm10Status).emoji}</span>
                        </div>
                        <div className={`p-10 rounded-[4rem] border-[6px] border-black/5 flex items-center justify-between ${getDustInfo(weather.pm25Status).bg} shadow-xl`}>
                          <div className="flex flex-col">
                            <span className="text-4xl font-black text-gray-400 mb-2">초미세먼지</span>
                            <span className={`text-7xl font-black ${getDustInfo(weather.pm25Status).color}`}>{weather.pm25Status}</span>
                          </div>
                          <span className="text-[8rem]">{getDustInfo(weather.pm25Status).emoji}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 상세 정보 그리드 - 더 큼직하게 */}
                  <div className="grid grid-cols-4 gap-8">
                    {[
                      { label: '자외선', value: weather.uv, icon: <Sun className="text-orange-400" size={80} />, color: 'bg-orange-50' },
                      { label: '강수확률', value: weather.rain, icon: <CloudRain className="text-blue-400" size={80} />, color: 'bg-blue-50' },
                      { label: '습도', value: weather.humidity, icon: <Droplets className="text-indigo-400" size={80} />, color: 'bg-indigo-50' },
                      { label: '풍속', value: weather.wind, icon: <Wind className="text-teal-400" size={80} />, color: 'bg-teal-50' }
                    ].map((item, i) => (
                      <div key={i} className={`${item.color} p-10 rounded-[4rem] border-[4px] border-black/5 flex flex-col items-center justify-center text-center shadow-md transform h-[380px]`}>
                        <div className="mb-6 bg-white p-6 rounded-full shadow-lg">
                          {item.icon}
                        </div>
                        <span className="text-4xl font-black text-gray-400 mb-3">{item.label}</span>
                        <span className="text-7xl font-black text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* 푸터 정보 */}
                  <div className="flex justify-between items-center pt-8">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-4 bg-gray-100 px-10 py-5 rounded-full border-4 border-black/5 shadow-sm">
                        <History className="text-gray-400" size={50} />
                        <span className="text-3xl font-bold text-gray-400">일몰 시간:</span>
                        <span className="text-5xl font-black text-gray-800">{weather.sunset}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => fetchWeatherWithSearch(true)}
                      className="group flex items-center space-x-6 bg-[#63C8FF] text-white px-16 py-8 rounded-full font-black text-5xl shadow-2xl hover:bg-[#4eb8f5] transition-all active:scale-95"
                    >
                      <RefreshCw className={`group-hover:rotate-180 transition-transform duration-700 ${isWeatherLoading ? 'animate-spin' : ''}`} size={60} />
                      <span className="text-5xl">날씨 새로고침</span>
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
            
            {weatherError && (
              <p className="mt-12 text-center text-red-500 font-black text-5xl bg-red-50 py-8 rounded-[3rem] border-[6px] border-red-100 animate-bounce">{weatherError}</p>
            )}
          </div>
        </motion.div>
      );
      case 2: return (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-8 pt-4 pb-2 flex justify-between items-center">
            <h2 className="text-[4rem] md:text-[7rem] font-black text-[#FF2DD1] flex items-center leading-none"><Smile className="mr-6" size={80} /> 너의 감정을 말해봐!</h2>
            <p className="hidden md:block text-2xl text-gray-400 font-bold bg-white/60 px-10 py-3 rounded-full shadow-inner">주머니를 선택하고 이름을 클릭하세요!</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-8">
            {Object.entries(CATEGORY_NAMES).map(([catId, catName]) => (
              <div key={catId} className="bg-white/40 rounded-[4rem] p-6 border-4 border-white/60 shadow-sm">
                <button 
                  onClick={() => setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])}
                  className="w-full flex justify-between items-center px-8 py-6 bg-white rounded-[2rem] shadow-md mb-4"
                >
                  <div className="flex items-center space-x-6">
                    <span className="text-6xl">{CATEGORY_ICONS[catId]}</span>
                    <span className="text-5xl font-black text-gray-700">{catName}</span>
                  </div>
                  <span className="text-4xl font-black text-pink-400">{expandedCategories.includes(catId) ? '접기 ▲' : '펼치기 ▼'}</span>
                </button>
                
                <AnimatePresence>
                  {expandedCategories.includes(catId) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EMOTIONS_DATA.filter(e => e.category === catId).map((emo) => {
                          const emoIdx = EMOTIONS_DATA.findIndex(e => e.name === emo.name);
                          return (
                            <div 
                              key={emo.name} 
                              onClick={() => setSelectedEmotionIndex(emoIdx)}
                              onDragOver={onDragOver} 
                              onDrop={() => onDropEmotion(emoIdx)} 
                              className={`${emo.color} rounded-none p-8 border-[12px] ${selectedEmotionIndex === emoIdx ? 'border-[#FF2DD1] scale-[1.02] z-10' : 'border-white'} shadow-2xl flex flex-col items-center min-h-[400px] transition-all cursor-pointer relative`}
                            >
                              <div className="flex flex-col items-center space-y-6 mb-6">
                                {emo.icon} <span className="text-[5rem] font-black text-gray-700 leading-none">{emo.name}</span>
                              </div>
                              <div className="flex flex-wrap justify-center gap-8 content-start min-h-[150px] w-full bg-white/40 rounded-[2.5rem] p-8 border-4 border-dashed border-white/60">
                                {students.filter(s => dailyEmotions[s.id] === emoIdx).map(s => (
                                  <motion.div layoutId={s.id} key={s.id} className="flex flex-col items-center group relative">
                                    {s.photo ? (
                                      <img src={s.photo} className="w-72 h-72 object-contain drop-shadow-2xl" alt={s.name} />
                                    ) : (
                                      <div className="w-60 h-60 bg-white rounded-full flex items-center justify-center font-black text-8xl shadow-inner text-gray-200">{s.name[0]}</div>
                                    )}
                                    <span className="text-[5.4rem] font-black text-gray-800 mt-[-2rem] bg-white/90 px-8 py-2 rounded-full shadow-md leading-none z-10">{s.name}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-t-[4rem] shadow-[0_-15px_50px_rgba(0,0,0,0.1)] border-t-[10px] border-pink-50 overflow-x-auto">
            <div className="flex gap-6 pb-2 px-10 items-center">
              {students.map(s => (
                <button 
                  key={s.id} 
                  draggable 
                  onDragStart={() => onDragStart(s.id)} 
                  onClick={() => {
                    if (dailyEmotions[s.id] !== undefined) {
                      setDailyEmotions(prev => {
                        const n = { ...prev };
                        delete n[s.id];
                        return n;
                      });
                    } else if (selectedEmotionIndex !== null) {
                      setDailyEmotions(prev => ({ ...prev, [s.id]: selectedEmotionIndex }));
                    }
                  }}
                  className={`flex-shrink-0 bg-white border-[5px] px-10 py-5 rounded-[2.5rem] text-[2.5rem] font-black shadow-xl active:scale-90 transition-all ${dailyEmotions[s.id] !== undefined ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-300'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="flex flex-col h-full space-y-6 p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-6">
              <h2 className="text-[5rem] md:text-[8rem] font-black text-[#4DFFBE] flex items-center tracking-tighter leading-none">
                <Play className="mr-8" size={100} fill="currentColor" /> 
                {selectedStudent ? `${selectedStudent.name}의 놀이` : "오늘의 놀이"}
              </h2>
              {selectedStudent && (
                <div className="flex items-center bg-white px-6 py-2 rounded-full shadow-md border-2 border-orange-100">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} className="w-20 h-20 object-contain rounded-full mr-4" />
                  ) : (
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center font-black text-2xl text-orange-200 mr-4">{selectedStudent.name[0]}</div>
                  )}
                  <span className="text-3xl font-black text-gray-700">{selectedStudent.name}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button onClick={() => {
                const newId = `q-${Date.now()}`;
                setPlayQuestions(prev => [...prev, { id: newId, label: '새 질문' }]);
                setEditingQuestionId(newId);
                setEditValue('새 질문');
              }} className="bg-orange-100 text-orange-500 px-8 py-6 rounded-[3rem] font-black text-3xl shadow-lg hover:bg-orange-200 transition-all active:scale-95 flex items-center space-x-2">
                <Plus size={30} /> <span>질문 추가</span>
              </button>
              <button onClick={downloadPlayTxt} title="기록 저장" className="bg-gray-100 text-gray-500 p-6 rounded-full hover:bg-gray-200 transition-all shadow-lg active:scale-90"><Download size={40} /></button>
              <button onClick={() => setIsPickModalOpen(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-6 rounded-[3rem] font-black text-4xl shadow-xl flex items-center space-x-4 active:scale-95 transition-all">
                <RotateCw size={40} /> <span>다시 뽑기!</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isPickModalOpen && (
              <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-10 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white p-16 rounded-[6rem] shadow-2xl border-[20px] border-orange-50 flex flex-col items-center relative w-full max-w-4xl"
                >
                  <h3 className="text-[6rem] font-black text-gray-800 mb-12 italic">누가 발표할까요?</h3>
                  <div className="relative mb-12 w-[30rem] h-[30rem] flex items-center justify-center">
                    {selectedStudent?.photo ? (
                      <img src={selectedStudent.photo} className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.3)]" />
                    ) : (
                      <div className="bg-gray-100 rounded-full w-[28rem] h-[28rem] flex items-center justify-center shadow-inner border-8 border-white text-gray-200 font-black text-[15rem]">{selectedStudent?.name[0] || "?"}</div>
                    )}
                    {!isSpinning && selectedStudent && <Sparkles className="absolute -top-10 -right-10 text-yellow-400 animate-bounce" size={150} />}
                  </div>
                  <h3 className="text-[10rem] font-black text-gray-800 tracking-tighter leading-none mb-12">{isSpinning ? "두구두구..." : selectedStudent ? `${selectedStudent.name}!` : "준비 완료!"}</h3>
                  
                  <div className="flex space-x-6 w-full">
                    <button 
                      onClick={pickRandomStudent} 
                      disabled={isSpinning || students.length === 0} 
                      className="flex-1 bg-[#4DFFBE] text-gray-800 py-10 rounded-[4rem] font-black text-5xl shadow-xl flex items-center justify-center space-x-4 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RotateCw className={isSpinning ? 'animate-spin' : ''} size={60} /> 
                      <span>{selectedStudent ? "다시 뽑기" : "뽑기 시작!"}</span>
                    </button>
                    {!isSpinning && selectedStudent && (
                      <div className="flex flex-1 space-x-4">
                        <button 
                          onClick={() => setIsPickModalOpen(false)} 
                          className="flex-1 bg-green-500 text-white py-10 rounded-[4rem] font-black text-5xl shadow-xl active:scale-95 transition-all"
                        >
                          확인!
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedStudent(null);
                            setIsPickModalOpen(false);
                          }} 
                          className="flex-1 bg-gray-400 text-white py-10 rounded-[4rem] font-black text-5xl shadow-xl active:scale-95 transition-all"
                        >
                          취소
                        </button>
                      </div>
                    )}
                    {!isSpinning && !selectedStudent && (
                      <button 
                        onClick={() => setIsPickModalOpen(false)} 
                        className="flex-1 bg-gray-400 text-white py-10 rounded-[4rem] font-black text-5xl shadow-xl active:scale-95 transition-all"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            {playQuestions.map((q) => (
              <div key={q.id} className="bg-white p-10 rounded-[4rem] shadow-lg border-b-[20px] border-orange-50/50 group relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6 font-black text-[6rem] text-gray-700">
                    <span className="text-orange-400">
                      {q.id === 'title' ? <MessageCircle size={80} /> : 
                       q.id === 'partners' ? <User size={80} /> : 
                       q.id === 'bestMoment' ? <Smile size={80} /> : 
                       q.id === 'hardMoment' ? <HelpCircle size={80} /> : 
                       q.id === 'interested' ? <UserPlus size={80} /> :
                       <Lightbulb size={80} />}
                    </span> 
                    {editingQuestionId === q.id ? (
                      <input 
                        autoFocus
                        className="bg-orange-50 border-none p-2 rounded-lg outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          if (editValue) {
                            setPlayQuestions(prev => prev.map(item => item.id === q.id ? { ...item, label: editValue } : item));
                          }
                          setEditingQuestionId(null);
                        }}
                      />
                    ) : (
                      <span>{q.label}</span>
                    )}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingQuestionId(q.id); setEditValue(q.label); }} className="p-2 text-gray-400 hover:text-orange-500"><Edit2 size={30}/></button>
                    <button onClick={() => setPlayQuestions(prev => prev.filter(item => item.id !== q.id))} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={30}/></button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <textarea 
                    className="flex-1 border-none bg-orange-50/40 rounded-[3rem] p-8 text-[4rem] font-black focus:ring-[15px] focus:ring-orange-100 outline-none transition-all h-60" 
                    value={playAnswers[q.id] || ""} 
                    onChange={(e) => setPlayAnswers({...playAnswers, [q.id]: e.target.value})} 
                    placeholder="적어주세요..." 
                  />
                </div>
              </div>
            ))}
            <div className="flex space-x-4 mt-10">
              <button 
                onClick={() => {
                  if (selectedStudent && (Object.values(playAnswers) as string[]).some(v => v.trim() !== "")) {
                    const newRecord = {
                      id: Date.now(),
                      studentId: selectedStudent.id,
                      studentName: selectedStudent.name,
                      answers: { ...playAnswers },
                      date: new Date().toLocaleString()
                    };
                    setPlayRecords(prev => [newRecord, ...prev]);
                    setPlayAnswers({});
                    alert("기록이 저장되었습니다!");
                  } else {
                    alert("저장할 내용이 없습니다.");
                  }
                }}
                className="flex-1 bg-green-500 text-white p-10 rounded-[4rem] flex items-center justify-center space-x-4 hover:bg-green-600 transition-all shadow-xl"
              >
                <Save size={60} /> <span className="text-4xl font-black">기록 완료 및 저장</span>
              </button>
              
              <button 
                onClick={() => {
                  const newId = `q-${Date.now()}`;
                  setPlayQuestions(prev => [...prev, { id: newId, label: '새 질문?' }]);
                  setEditingQuestionId(newId);
                  setEditValue('새 질문?');
                }}
                className="flex-1 bg-orange-100 text-orange-500 p-10 rounded-[4rem] border-4 border-dashed border-orange-200 flex items-center justify-center space-x-4 hover:bg-orange-200 transition-all"
              >
                <Plus size={60} /> <span className="text-4xl font-black">질문 추가하기</span>
              </button>
            </div>

            {/* 히스토리 섹션 */}
            {playRecords.length > 0 && (
              <div className="mt-20 pt-20 border-t-8 border-orange-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-6xl font-black text-orange-600 flex items-center"><History className="mr-4" size={60} /> 이전 기록들</h3>
                  <button 
                    onClick={() => {
                      if(confirm("모든 이전 기록을 삭제할까요?")) setPlayRecords([]);
                    }}
                    className="text-3xl font-bold text-gray-400 hover:text-red-500"
                  >
                    기록 전체 삭제
                  </button>
                </div>
                <div className="space-y-8">
                  {playRecords.map((record) => (
                    <div key={record.id} className="bg-white/60 p-10 rounded-[4rem] border-4 border-orange-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-5xl font-black text-orange-500">{record.studentName} 어린이</span>
                        <span className="text-3xl font-bold text-gray-400">{record.date}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {playQuestions.map(q => (
                          <div key={q.id} className="bg-white/80 p-6 rounded-[2rem]">
                            <p className="text-2xl font-bold text-gray-400 mb-2">{q.label}</p>
                            <p className="text-4xl font-black text-gray-700">{record.answers[q.id] || '(내용 없음)'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
      case 4: return (
        <div className="flex flex-col h-full space-y-6 p-12 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <h2 className="text-[6rem] md:text-[10rem] font-black text-indigo-600 flex items-center tracking-tighter leading-none drop-shadow-sm"><HandMetal className="mr-8" size={100} /> 오늘의 활동</h2>
            <button onClick={() => { setEditingActivityIdx('new'); setEditValue(""); }} className="bg-indigo-500 text-white p-8 rounded-full shadow-lg hover:bg-indigo-600 active:scale-90 transition-all"><Plus size={60} /></button>
          </div>
          <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto pb-40">
            {activities.map((act, idx) => (
              <motion.div 
                layout
                key={idx} 
                draggable
                onDragStart={() => { draggingActivityIdx.current = idx; }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDragEnter={() => {
                  const fromIdx = draggingActivityIdx.current;
                  if (fromIdx !== null && fromIdx !== idx) {
                    const n = [...activities];
                    const [removed] = n.splice(fromIdx, 1);
                    n.splice(idx, 0, removed);
                    setActivities(n);
                    draggingActivityIdx.current = idx;
                  }
                }}
                onDrop={() => {
                  draggingActivityIdx.current = null;
                }}
                className="bg-white w-full p-4 rounded-[4rem] shadow-lg border-l-[40px] border-indigo-400 flex justify-center items-center group transition-all relative min-h-[120px] cursor-move"
              >
                {editingActivityIdx === idx ? (
                  <div className="flex items-center w-full px-12 space-x-6">
                    <input autoFocus className="flex-1 text-[4rem] font-black text-gray-800 bg-indigo-50 p-6 rounded-[3rem] outline-none leading-none shadow-inner" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    <button onClick={() => { if(editValue) { const n = [...activities]; n[idx] = editValue; setActivities(n); setEditingActivityIdx(null); }}} className="bg-green-500 text-white p-6 rounded-[2.5rem] shadow-xl"><Check size={40}/></button>
                    <button onClick={() => setEditingActivityIdx(null)} className="bg-gray-400 text-white p-6 rounded-[2.5rem] shadow-xl"><X size={40}/></button>
                  </div>
                ) : (
                  <>
                    <span className="text-[5rem] md:text-[8rem] font-black text-gray-700 text-center leading-none drop-shadow-sm">{act}</span>
                    <div className="absolute right-12 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingActivityIdx(idx); setEditValue(act); }} className="bg-gray-50 p-4 rounded-[2rem] text-indigo-500 shadow-md active:scale-90"><Edit2 size={40} /></button>
                      <button onClick={() => setActivities(activities.filter((_, i) => i !== idx))} className="bg-red-50 p-4 rounded-[2rem] text-red-500 shadow-md active:scale-90"><Trash2 size={40} /></button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
            {editingActivityIdx === 'new' && (
              <div className="bg-white w-full p-8 rounded-[4rem] shadow-lg border-l-[40px] border-green-400 flex items-center space-x-6">
                <input autoFocus className="flex-1 text-[4rem] font-black text-gray-800 bg-green-50 p-6 rounded-[3rem] outline-none leading-none shadow-inner" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="새 활동 입력..." />
                <button onClick={() => { if(editValue) { setActivities([...activities, editValue]); setEditingActivityIdx(null); }}} className="bg-green-500 text-white p-6 rounded-[2.5rem] shadow-xl"><Check size={40}/></button>
                <button onClick={() => setEditingActivityIdx(null)} className="bg-gray-400 text-white p-6 rounded-[2.5rem] shadow-xl"><X size={40}/></button>
              </div>
            )}
          </div>
        </div>
      );
      case 5: return (
        <div className="flex flex-col items-center justify-center h-full p-8 overflow-hidden">
          <h2 className="text-[6rem] md:text-[10rem] font-black text-[#FF5B5B] mb-8 flex items-center tracking-tighter leading-none drop-shadow-sm"><Utensils size={150} className="mr-12" /> 오늘의 급식</h2>
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-7xl bg-white p-12 rounded-[10rem] shadow-2xl border-[30px] border-dashed border-[#FF5B5B]/10 h-fit min-h-[95vh] flex flex-col items-center justify-center relative overflow-hidden group pointer-events-auto"
          >
            <div className="overflow-y-auto w-full h-full custom-scrollbar p-12 flex items-center justify-center text-center">
              <p className="text-[6rem] md:text-[9rem] font-black text-gray-800 leading-[1.4] whitespace-pre-line drop-shadow-xl py-20">
                {lunchMenu || "설정에서 식단표를 등록하세요!"}
              </p>
            </div>
            <button 
              onClick={() => { 
                const input = prompt("식단을 직접 수정하세요:", (lunchMenu || "").replace(/\n/g, ", ")); 
                if(input !== null) setLunchMenu(cleanMealText(input)); 
              }} 
              className="absolute bottom-12 bg-green-500 text-white px-20 py-8 rounded-full font-black text-4xl hover:bg-green-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-xl active:scale-95 z-50"
            >
              식단 수정
            </button>
          </motion.div>
        </div>
      );
      case 6: return (
        <div className="flex flex-col h-full p-12 overflow-hidden space-y-12">
          <div className="text-center">
            <h2 className="text-[6rem] md:text-[10rem] font-black text-pink-500 flex items-center justify-center tracking-tighter leading-none drop-shadow-sm">
              <Sparkles size={120} className="mr-8 text-yellow-400 animate-pulse" /> 긍정 확언
            </h2>
          </div>

          <div className="flex flex-row justify-center gap-8 max-w-6xl mx-auto w-full overflow-x-auto pb-4 custom-scrollbar">
            {(Object.entries(affirmations) as [string, { title: string, items: string[] }][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  const randomIdx = Math.floor(Math.random() * cat.items.length);
                  setSelectedAffirmation({ category: cat.title, text: cat.items[randomIdx] });
                }}
                className="bg-white px-12 py-8 rounded-[3rem] shadow-xl border-b-[10px] border-pink-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center whitespace-nowrap group"
              >
                <span className="text-5xl font-black text-gray-700 group-hover:text-pink-500 transition-colors">{cat.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedAffirmation && (
              <motion.div
                key={selectedAffirmation.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-1 flex flex-col items-center justify-center p-10 text-center relative"
              >
                <p className="text-[10rem] md:text-[15rem] font-black text-gray-800 leading-tight drop-shadow-2xl whitespace-pre-line">
                  {selectedAffirmation.text}
                </p>
              </motion.div>
            )}
            {!selectedAffirmation && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-black text-gray-200 italic">카테고리를 선택해 보세요!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      );
      case 7: return (
        <div className="flex flex-col h-full p-6 overflow-hidden space-y-4">
           <div className="text-center space-y-1">
              <Trophy size={80} className="text-yellow-400 mx-auto drop-shadow-2xl animate-bounce" />
              <h2 className="text-[6rem] font-black text-blue-600 tracking-tighter leading-none">해볼라고!</h2>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 flex-1 overflow-hidden pb-12">
              <div className="bg-white p-10 rounded-[6rem] shadow-2xl border-4 border-blue-50 flex flex-col space-y-10 h-full">
                 <div className="space-y-6">
                    <h3 className="text-4xl font-black text-gray-700 flex items-center leading-none"><Edit2 className="mr-6 text-blue-400" size={50}/> 무엇을 도전할까요?</h3>
                    <input type="text" className="w-full bg-blue-50/50 border-none p-10 rounded-[4rem] text-[4rem] font-black text-blue-700 focus:ring-[20px] focus:ring-blue-100 outline-none leading-none shadow-inner" value={newChallengeTitle} onChange={(e) => setNewChallengeTitle(e.target.value)} placeholder="도전 내용 입력!" />
                 </div>
                 <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-[2.5rem] font-bold text-gray-400 border-b-8 border-blue-50 pb-6 tracking-tighter">도전자 선택 (이름 클릭 또는 드래그)</h3>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50 rounded-[5rem] mt-6 shadow-inner border-[6px] border-white">
                       <div className="flex flex-wrap gap-4">
                          {students.map(s => (
                            <button 
                              key={s.id} draggable onDragStart={() => onDragStart(s.id)}
                              onClick={() => setCurrentChallengeParticipants(prev => prev.some(p => p.id === s.id) ? prev.filter(p => p.id !== s.id) : [...prev, s])}
                              className={`px-8 py-4 rounded-[2rem] text-[3rem] font-black border-4 transition-all ${currentChallengeParticipants.some(p => p.id === s.id) ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-110' : 'bg-white border-gray-100 text-gray-300'}`}
                            >
                              {s.name}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="flex space-x-4">
                    <button onClick={handleAddChallenge} className="flex-1 bg-blue-600 text-white py-10 rounded-[6rem] text-[4rem] font-black shadow-[0_40px_80px_rgba(37,99,235,0.4)] active:scale-95 transition-all leading-none">
                      {editingChallengeId ? "도전자 수정!" : "도전자 등록!"}
                    </button>
                    {editingChallengeId && (
                      <button 
                        onClick={() => {
                          setEditingChallengeId(null);
                          setNewChallengeTitle("");
                          setCurrentChallengeParticipants([]);
                        }} 
                        className="bg-gray-200 text-gray-600 px-10 py-10 rounded-[6rem] text-[3rem] font-black active:scale-95 transition-all leading-none"
                      >
                        취소
                      </button>
                    )}
                  </div>
              </div>

              <div onDragOver={onDragOver} onDrop={onDropChallenge} className="flex flex-col h-full min-h-0 bg-white/70 rounded-[8rem] p-12 border-8 border-white shadow-2xl relative">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[5rem] font-black text-gray-800 flex items-center leading-none tracking-tighter"><ZapIcon className="mr-8 text-yellow-400" size={80}/> 오늘의 도전자</h3>
                    <div className="flex space-x-4">
                      <button onClick={downloadChallengeTxt} title="저장" className="bg-blue-100 text-blue-500 p-8 rounded-full hover:bg-blue-200 transition-all shadow-xl active:scale-90 border-4 border-white"><Download size={40}/></button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-12 pb-10">
                    <AnimatePresence>
                      {challenges.filter(c => c.date === today).map(c => (
                        <motion.div 
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -50, opacity: 0 }}
                          key={c.id} 
                          className="bg-white p-10 rounded-[6rem] shadow-xl border-l-[60px] border-blue-400 relative group"
                        >
                           <div className="absolute top-10 right-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => {
                               setEditingChallengeId(c.id);
                               setNewChallengeTitle(c.title);
                               setCurrentChallengeParticipants(c.participants);
                             }} className="text-gray-200 hover:text-blue-400"><Edit2 size={60}/></button>
                             <button onClick={() => setChallenges(challenges.filter(item => item.id !== c.id))} className="text-gray-200 hover:text-red-400"><Trash2 size={60}/></button>
                           </div>
                           <h4 className="text-[5rem] font-black text-blue-900 mb-8 italic underline decoration-blue-100 decoration-[20px] underline-offset-[24px] leading-none">"{c.title}"</h4>
                           <div className="flex flex-wrap gap-8">
                              {c.participants.map(p => (
                                  <div key={p.id} className="flex flex-col items-center bg-gray-50 p-6 rounded-[3rem] shadow-inner border-4 border-white group/p relative">
                                     {p.photo ? <img src={p.photo} className="w-24 h-24 object-contain drop-shadow-2xl" /> : <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-black text-[4rem] text-gray-200 shadow-sm leading-none">{p.name[0]}</div>}
                                     <span className="text-[2.5rem] font-black text-gray-600 mt-[-1rem] leading-none z-10">{p.name}</span>
                                     <button 
                                       onClick={() => {
                                         setChallenges(prev => prev.map(item => item.id === c.id ? { ...item, participants: item.participants.filter(part => part.id !== p.id) } : item));
                                       }}
                                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/p:opacity-100 transition-opacity"
                                     >
                                       <X size={20}/>
                                     </button>
                                  </div>
                              ))}
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {challenges.filter(c => c.date === today).length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-200 py-40 border-[25px] border-dashed border-gray-200 rounded-[10rem] bg-white/30">
                         <p className="text-[6rem] font-black opacity-30 tracking-widest leading-none">도전자 대기 중!</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      );
      case 8: return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full text-center p-12 bg-gradient-to-br from-[#FFF58A] via-[#FFBBE1] to-[#B3BFFF] overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="mb-12"
          >
            <h2 className="text-[12rem] font-black text-gray-800 drop-shadow-2xl tracking-tighter">햇빛2반 구호!</h2>
          </motion.div>
          <div className="flex flex-col space-y-12">
            <motion.span 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[10rem] md:text-[15rem] font-black text-[#DD7BDF] drop-shadow-2xl leading-none"
            >
              따뜻하고,
            </motion.span>
            <motion.span 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10rem] md:text-[15rem] font-black text-gray-700 drop-shadow-2xl leading-none"
            >
              단단하고,
            </motion.span>
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[10rem] md:text-[15rem] font-black text-blue-500 drop-shadow-2xl leading-none"
            >
              씩씩하게!
            </motion.span>
          </div>
        </motion.div>
      );
      default: return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <div className="w-[200%] h-[200%] origin-top-left scale-50 flex flex-col text-gray-800 select-none">
        <button onClick={() => setIsSettingsOpen(true)} className="fixed top-8 right-8 p-6 bg-white/30 backdrop-blur-xl rounded-full text-gray-300 hover:text-orange-500 hover:bg-white transition-all z-50 shadow-md border border-white/40 active:scale-90">
          <Settings size={40} />
        </button>

        <main className="flex-1 overflow-hidden relative bg-[radial-gradient(#e5e7eb_4px,transparent_4px)] [background-size:100px_100px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="p-4 flex justify-around items-center z-20 overflow-x-auto custom-scrollbar">
          {[ 
            { i: <Calendar size={50} />, l: "오늘" }, 
            { i: <Cloud size={50} />, l: "날씨" }, 
            { i: <Smile size={50} />, l: "기분" }, 
            { i: <Play size={50} />, l: "놀이" }, 
            { i: <HandMetal size={50} />, l: "활동" }, 
            { i: <Utensils size={50} />, l: "급식" }, 
            { i: <Sparkles size={50} />, l: "확언" },
            { i: <Trophy size={50} />, l: "도전" }, 
            { i: <ShieldCheck size={50} />, l: "구호" }
          ].map((it, idx) => (
            <button key={idx} onClick={() => setCurrentStep(idx)} className={`flex flex-col items-center px-8 md:px-12 py-4 rounded-[2.5rem] transition-all duration-300 ${currentStep === idx ? 'text-orange-500 scale-125 -translate-y-4' : 'text-gray-400 hover:text-gray-600'}`}>
              {it.i}
              <span className="text-2xl font-black mt-2">{it.l}</span>
            </button>
          ))}
        </nav>

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col"
            >
              <div className="p-10 border-b-4 border-gray-100 flex justify-between items-center bg-gray-50/80">
                <h2 className="text-6xl font-black text-gray-800 flex items-center tracking-tighter leading-none"><Settings className="mr-6 text-blue-400" size={60}/> 설정</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-4 text-gray-300 hover:text-red-500 transition-all hover:scale-110"><X size={80}/></button>
              </div>

              {/* 탭 메뉴 */}
              <div className="flex border-b-4 border-gray-100 mb-8 overflow-x-auto bg-white">
                {[
                  { id: 'students', label: '학생 명단', icon: <UserPlus size={40} /> },
                  { id: 'lunch', label: '급식 식단', icon: <Utensils size={40} /> },
                  { id: 'affirmations', label: '긍정 확언', icon: <Sparkles size={40} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id as any)}
                    className={`flex items-center space-x-4 px-16 py-8 text-[18px] font-black transition-all border-b-8 ${
                      settingsTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                {settingsTab === 'students' && (
                  <div className="space-y-12 max-w-7xl mx-auto">
                    <div className="bg-blue-50 p-12 rounded-[4rem] border-4 border-blue-100 shadow-inner">
                      <h3 className="text-5xl font-black text-blue-800 mb-8 flex items-center">
                        <Upload className="mr-6" size={60} /> 엑셀로 학생 등록하기
                      </h3>
                      <p className="text-3xl text-blue-600 mb-10 leading-relaxed">
                        엑셀 파일(.xlsx)을 업로드하면 학생 명단이 자동으로 등록됩니다.<br/>
                        (A열: 이름, B열: 사진URL - 사진은 선택사항입니다)
                      </p>
                      <label className="block w-full bg-blue-500 text-white py-10 rounded-[3rem] text-center cursor-pointer hover:bg-blue-600 transition-all shadow-xl active:scale-95 font-black text-4xl">
                        파일 선택하기
                        <input type="file" accept=".xlsx" onChange={handleExcelUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {students.map(s => (
                        <div key={s.id} className="bg-white p-8 rounded-[3rem] shadow-lg border-4 border-gray-50 flex items-center justify-between group hover:border-blue-200 transition-all">
                          <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 flex items-center justify-center relative">
                              {s.photo ? (
                                <img src={s.photo} className="w-full h-full object-contain drop-shadow-md" />
                              ) : (
                                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center text-gray-200 font-bold shadow-inner text-4xl">{s.name[0]}</div>
                              )}
                              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <Camera className="text-white" size={40} />
                                <input type="file" accept="image/*" className="hidden" onChange={(e: any) => {
                                  const r = new FileReader();
                                  r.onload = (evt: any) => setStudents(students.map(st => st.id === s.id ? {...st, photo: evt.target.result} : st));
                                  r.readAsDataURL(e.target.files[0]);
                                }} />
                              </label>
                            </div>
                            <span className="text-4xl font-black text-gray-700">{s.name}</span>
                          </div>
                          <button onClick={() => setStudents(prev => prev.filter(st => st.id !== s.id))} className="text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                            <Trash2 size={40} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const name = prompt("학생 이름을 입력하세요:");
                        if (name) setStudents(prev => [...prev, { id: Date.now().toString(), name }]);
                      }} className="bg-gray-50 border-8 border-dashed border-gray-200 p-8 rounded-[3rem] flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all hover:text-gray-600">
                        <Plus size={60} className="mr-4" /> <span className="text-4xl font-black">학생 추가</span>
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'lunch' && (
                  <div className="space-y-12 max-w-7xl mx-auto">
                    <div className="bg-green-50 p-12 rounded-[4rem] border-4 border-green-100 shadow-inner">
                      <h3 className="text-5xl font-black text-green-800 mb-8 flex items-center">
                        <FileText className="mr-6" size={60} /> 식단표 텍스트 붙여넣기
                      </h3>
                      <p className="text-3xl text-green-600 mb-10 leading-relaxed">
                        학교 홈페이지의 월간 식단표 텍스트를 복사해서 붙여넣으세요.<br/>
                        오늘 날짜({todayMonth}월 {todayDay}일)를 찾아 자동으로 정리해드립니다!
                      </p>
                      <textarea 
                        className="w-full h-[400px] p-10 rounded-[3rem] border-4 border-green-200 focus:ring-[20px] focus:ring-green-100 outline-none text-3xl font-black shadow-inner"
                        placeholder="여기에 식단표 텍스트를 붙여넣으세요..."
                        onChange={(e) => setRawMealText(e.target.value)}
                      />
                      <button onClick={() => processMealText(rawMealText)} className="mt-8 w-full bg-green-500 text-white py-8 rounded-[3rem] font-black text-5xl shadow-xl hover:bg-green-600 active:scale-95">식단 자동 분석</button>
                    </div>
                    <div className="bg-white p-12 rounded-[4rem] border-4 border-gray-100 shadow-lg">
                      <h3 className="text-4xl font-black text-gray-800 mb-8">현재 설정된 식단</h3>
                      <textarea 
                        className="w-full h-60 p-10 rounded-[3rem] border-4 border-gray-200 focus:ring-[20px] focus:ring-gray-100 outline-none text-4xl font-black"
                        value={lunchMenu}
                        onChange={(e) => setLunchMenu(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {settingsTab === 'affirmations' && (
                  <div className="space-y-12 max-w-7xl mx-auto">
                    {(Object.entries(affirmations) as [string, { title: string, items: string[] }][]).map(([key, cat]) => (
                      <div key={key} className="bg-purple-50 p-12 rounded-[4rem] border-4 border-purple-100 shadow-inner">
                        <div className="flex justify-between items-center mb-10">
                          <div className="flex items-center space-x-6">
                            <Sparkles className="text-purple-500" size={60} />
                            <input 
                              className="text-5xl font-black text-purple-800 bg-transparent border-none outline-none focus:ring-4 focus:ring-purple-200 rounded-2xl px-4 py-2"
                              value={cat.title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setAffirmations(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key], title: newTitle }
                                }));
                              }}
                            />
                          </div>
                          <button 
                            onClick={() => {
                              if(confirm("이 카테고리를 삭제할까요?")) {
                                const newAffs = { ...affirmations };
                                delete newAffs[key];
                                setAffirmations(newAffs);
                              }
                            }}
                            className="text-purple-200 hover:text-red-500 p-4 transition-colors"
                          >
                            <Trash2 size={50} />
                          </button>
                        </div>
                        <div className="space-y-6">
                          {cat.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-6 bg-white p-8 rounded-[2.5rem] shadow-md group hover:border-purple-200 border-4 border-transparent transition-all">
                              <span className="text-purple-300 font-black text-3xl w-12">{idx + 1}</span>
                              <input 
                                className="flex-1 text-3xl font-black text-gray-700 border-none outline-none focus:ring-4 focus:ring-purple-100 rounded-2xl px-4 py-2"
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...cat.items];
                                  newItems[idx] = e.target.value;
                                  setAffirmations(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], items: newItems }
                                  }));
                                }}
                              />
                              <button 
                                onClick={() => {
                                  const newItems = cat.items.filter((_, i) => i !== idx);
                                  setAffirmations(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], items: newItems }
                                  }));
                                }}
                                className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                              >
                                <X size={40} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              setAffirmations(prev => ({
                                ...prev,
                                [key]: { ...prev[key], items: [...prev[key], "새로운 확언을 입력하세요."] }
                              }));
                            }}
                            className="w-full py-8 border-4 border-dashed border-purple-200 rounded-[2.5rem] text-purple-400 font-black text-3xl hover:bg-purple-100/50 transition-all flex items-center justify-center hover:text-purple-600"
                          >
                            <Plus size={40} className="mr-4" /> 확언 추가하기
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const id = `cat-${Date.now()}`;
                        setAffirmations(prev => ({
                          ...prev,
                          [id]: { title: "새 카테고리", items: ["새 확언"] }
                        }));
                      }}
                      className="w-full py-12 bg-purple-500 text-white rounded-[4rem] font-black text-5xl shadow-2xl hover:bg-purple-600 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Plus size={60} className="mr-6" /> 카테고리 추가하기
                    </button>
                  </div>
                )}
              </div>
              <div className="p-16 bg-gray-50 text-center border-t-8 border-gray-100">
                <button onClick={() => setIsSettingsOpen(false)} className="bg-gray-800 text-white px-32 py-10 rounded-full font-black text-[4rem] shadow-2xl active:scale-95 leading-none">설정 완료!</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
