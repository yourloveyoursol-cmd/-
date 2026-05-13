import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'hb2-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true, 
    sameSite: 'none',
    httpOnly: true 
  }
}));

// Naver Weather Proxy API
app.get("/api/weather/naver", async (req, res) => {
  try {
    const location = (req.query.location as string) || "시흥시 장현동";
    
    // 1. Official Search API Call (if keys exist)
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    let searchMetadata = "";

    if (clientId && clientSecret) {
      try {
        const searchRes = await axios.get("https://openapi.naver.com/v1/search/webkr.json", {
          params: { query: `${location} 날씨`, display: 1 },
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret
          }
        });
        searchMetadata = JSON.stringify(searchRes.data.items[0]);
      } catch (e) {
        console.warn("Naver Official Search API failed");
      }
    }

    // 2. Scraping Naver Weather (Search using the provided location)
    const weatherUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(location + " 날씨")}`;
    const { data: html } = await axios.get(weatherUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(html);
    const weatherContent = $(".content_area").text().slice(0, 3000) || $("body").text().slice(0, 3000);

    res.json({
      rawText: weatherContent,
      location: location,
      searchMetadata,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Naver Weather Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Naver weather data" });
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
