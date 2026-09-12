import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { addDays, formatKorean } from "./src/lib/date";
import { splitMenuLines, classifyToTray } from "./src/lib/mealParser";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- NEIS(나이스 교육정보개방포털) 급식 정보 프록시 ---
const NEIS_BASE = "https://open.neis.go.kr/hub";
const OFFICE_CODE = process.env.NEIS_OFFICE_CODE || "J10"; // 경기도교육청
const KINDER_NAME = process.env.NEIS_SCHOOL_NAME || "빛가람유치원";
let cachedSchoolCode = process.env.NEIS_SCHOOL_CODE || "";

async function resolveSchoolCode(apiKey: string): Promise<string> {
  if (cachedSchoolCode) return cachedSchoolCode;

  const url = new URL(`${NEIS_BASE}/childSchoolInfo`);
  url.searchParams.set("KEY", apiKey);
  url.searchParams.set("Type", "json");
  url.searchParams.set("ATPT_OFCDC_SC_CODE", OFFICE_CODE);
  url.searchParams.set("KINDER_NM", KINDER_NAME);

  const res = await fetch(url.toString());
  const data = await res.json();
  const row = data?.childSchoolInfo?.[1]?.row?.[0];
  if (!row?.SD_SCHUL_CODE) {
    throw new Error(`유치원 정보를 찾을 수 없습니다 (${KINDER_NAME})`);
  }
  cachedSchoolCode = row.SD_SCHUL_CODE;
  return cachedSchoolCode;
}

async function fetchMealForDate(apiKey: string, schoolCode: string, dateKey: string) {
  const ymd = dateKey.replace(/-/g, "");
  const url = new URL(`${NEIS_BASE}/mealServiceDietInfo`);
  url.searchParams.set("KEY", apiKey);
  url.searchParams.set("Type", "json");
  url.searchParams.set("ATPT_OFCDC_SC_CODE", OFFICE_CODE);
  url.searchParams.set("SD_SCHUL_CODE", schoolCode);
  url.searchParams.set("MLSV_YMD", ymd);

  const res = await fetch(url.toString());
  const data = await res.json();
  const rows = data?.mealServiceDietInfo?.[1]?.row;
  if (!rows || rows.length === 0) return null;

  // 중식(점심) 정보를 우선 사용, 없으면 첫 번째 행 사용
  const lunch = rows.find((r: any) => r.MMEAL_SC_CODE === "2") || rows[0];
  return lunch?.DDISH_NM as string | undefined;
}

app.get("/api/meal", async (req, res) => {
  try {
    const requestedDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const apiKey = process.env.NEIS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "NEIS_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인해주세요." });
    }

    const schoolCode = await resolveSchoolCode(apiKey);

    let cursor = requestedDate;
    let ddishNm: string | undefined;
    let triesLeft = 10;
    while (triesLeft > 0) {
      ddishNm = (await fetchMealForDate(apiKey, schoolCode, cursor)) || undefined;
      if (ddishNm) break;
      cursor = addDays(cursor, -1);
      triesLeft -= 1;
    }

    if (!ddishNm) {
      return res.status(404).json({ error: "최근 급식 정보를 찾을 수 없습니다." });
    }

    const items = splitMenuLines(ddishNm);
    const tray = classifyToTray(items);
    const isSubstitute = cursor !== requestedDate;

    res.json({
      requestedDate,
      actualDate: cursor,
      isSubstitute,
      note: isSubstitute
        ? `${requestedDate}에는 급식 정보가 없어 가장 최근 평일인 ${formatKorean(cursor)} 식단으로 표시합니다.`
        : undefined,
      items,
      tray,
    });
  } catch (error: any) {
    console.error("NEIS Meal Fetch Error:", error.message);
    res.status(500).json({ error: error.message || "급식 정보를 불러오지 못했습니다." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
