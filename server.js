const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const fallbackScenes = [
  {
    keywords: ["杭州马拉松", "杭马", "杭州全马"],
    name: "杭州马拉松",
    scene: makeScene({ runType: "road", detail: "road-marathon", location: "杭州", distance: 42.2, duration: "3小时45分", eventTime: "比赛日 07:30", pace: "全马比赛，稳妥完赛" }),
    evidence: "本地兜底：名称包含马拉松/杭马，按路跑全马处理。"
  },
  {
    keywords: ["上海半马", "上海半程", "上马半马"],
    name: "上海半程马拉松",
    scene: makeScene({ runType: "road", detail: "road-half", location: "上海", distance: 21.1, duration: "1小时45分", eventTime: "比赛日 07:00", pace: "半马比赛，稳定输出" }),
    evidence: "本地兜底：名称包含半马/半程，按路跑半马处理。"
  },
  {
    keywords: ["崇礼168", "崇礼", "168"],
    name: "崇礼168",
    scene: makeScene({
      runType: "trail",
      detail: "trail-ultra",
      temp: 8,
      humidity: 62,
      wind: "wind",
      rain: "rain",
      altitude: 1800,
      location: "张家口 · 崇礼",
      distance: 100,
      duration: "18-28小时",
      eventTime: "比赛日 06:00",
      pace: "百公里 / 超长距离，安全完赛"
    }),
    evidence: "本地兜底：名称包含168/崇礼，按越野超长距离处理。"
  },
  {
    keywords: ["uto", "UTO", "首百", "香山", "越野训练赛", "北京香山"],
    name: "UTO助力首百越野训练赛 · 北京香山",
    scene: makeScene({
      mode: "race",
      runType: "trail",
      detail: "trail-mid",
      temp: 10,
      humidity: 65,
      wind: "wind",
      rain: "dry",
      altitude: 650,
      location: "北京 · 香山",
      distance: 20,
      duration: "3-4小时",
      eventTime: "比赛日 08:00",
      pace: "越野训练赛，按中距离保守携带"
    }),
    evidence: "本地兜底：名称包含 UTO/首百/香山/越野训练赛，按北京香山越野训练赛处理。"
  }
];

const knownLocations = [
  { keys: ["北京香山", "北京 · 香山", "香山"], name: "北京 · 香山", latitude: 39.994, longitude: 116.188 },
  { keys: ["杭州", "西湖"], name: "杭州 · 西湖区", latitude: 30.259, longitude: 120.13 },
  { keys: ["上海", "浦东"], name: "上海 · 浦东新区", latitude: 31.23, longitude: 121.54 },
  { keys: ["崇礼", "张家口"], name: "张家口 · 崇礼", latitude: 40.97, longitude: 115.28 },
  { keys: ["莫干山"], name: "莫干山", latitude: 30.61, longitude: 119.87 }
];

function makeScene(overrides = {}) {
  return {
    mode: "race",
    sport: "running",
    runType: "road",
    detail: "road-marathon",
    temp: 14,
    humidity: 70,
    wind: "calm",
    rain: "dry",
    sun: "cloudy",
    altitude: 20,
    location: "待确认地点",
    distance: 42.2,
    duration: "用时待确认",
    eventTime: "时间待确认",
    pace: "比赛日，稳妥完赛",
    ...overrides
  };
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractDuckDuckGoResults(html) {
  const results = [];
  const blocks = html.match(/<div class="result[\s\S]*?<\/div>\s*<\/div>/g) || [];

  for (const block of blocks.slice(0, 6)) {
    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/);
    const urlMatch = block.match(/class="result__url"[^>]*>([\s\S]*?)<\/a>|class="result__url"[^>]*>([\s\S]*?)<\/span>/);
    if (!titleMatch) continue;
    results.push({
      title: stripTags(titleMatch[1]),
      snippet: stripTags((snippetMatch && (snippetMatch[1] || snippetMatch[2])) || ""),
      url: stripTags((urlMatch && (urlMatch[1] || urlMatch[2])) || "")
    });
  }

  return results;
}

function classifyRace(query, results) {
  const text = `${query} ${results.map((item) => `${item.title} ${item.snippet}`).join(" ")}`;
  const lower = text.toLowerCase();
  const hasTrail = /越野|山地|爬升|trail|utmb|ultra|tnf|168|百公里|首百|香山|越野赛|训练赛/.test(lower);
  const hasRoad = /马拉松|半马|半程|全马|路跑|城市|10k|5k|marathon/.test(lower);
  const runType = hasTrail && !/路跑|城市马拉松/.test(lower) ? "trail" : "road";
  let detail = runType === "trail" ? "trail-mid" : "road-marathon";
  let pace = "比赛日，稳妥完赛";
  let distance = inferDistance(lower);

  if (runType === "trail") {
    if (/香山|助力首百|越野训练赛|训练赛/.test(lower)) {
      detail = "trail-mid";
      distance = distance || 20;
      pace = "越野训练赛，按中距离保守携带";
    } else if (/168|100\s?km|100公里|百公里|超长|ultra/.test(lower)) {
      detail = "trail-ultra";
      distance = distance || 100;
      pace = "百公里 / 超长距离，安全完赛";
    } else if (/50\s?km|50公里|70\s?km|长距离/.test(lower)) {
      detail = "trail-long";
      distance = distance || 50;
      pace = "越野长距离，保守携带";
    } else if (/25\s?km|30\s?km|35\s?km|42\s?km|中距离/.test(lower)) {
      detail = "trail-mid";
      distance = distance || 30;
      pace = "越野中距离，稳定完赛";
    } else if (/10\s?km|15\s?km|20\s?km|短距离/.test(lower)) {
      detail = "trail-short";
      distance = distance || 15;
      pace = "越野短距离，轻量完成";
    }
  } else {
    if (/半马|半程|21\.0975|21k|21\s?km/.test(lower)) {
      detail = "road-half";
      distance = distance || 21.1;
      pace = "半马比赛，稳定输出";
    } else if (/10k|10\s?km|十公里/.test(lower)) {
      detail = "road-10k";
      distance = distance || 10;
      pace = "10K 比赛，高强度输出";
    } else if (/5k|5\s?km|五公里/.test(lower)) {
      detail = "road-5k";
      distance = distance || 5;
      pace = "5K 比赛，轻量竞速";
    } else if (/全马|马拉松|42\.195|42\s?km|marathon/.test(lower)) {
      detail = "road-marathon";
      distance = distance || 42.2;
      pace = "全马比赛，稳妥完赛";
    }
  }

  const location = inferLocation(text);
  const altitude = location.includes("香山") ? 650 : runType === "trail" ? 800 : 20;
  const temp = runType === "trail" ? 10 : 14;
  const rain = /雨|降雨|rain|wet|泥/.test(lower) ? "rain" : "dry";
  const wind = /风|大风|wind/.test(lower) ? "wind" : "calm";

  return {
    mode: "race",
    sport: hasRoad || hasTrail ? "running" : "running",
    runType,
    detail,
    temp,
    humidity: rain === "rain" ? 78 : 65,
    wind,
    rain,
    sun: "cloudy",
    altitude,
    location,
    distance: distance || (runType === "trail" ? 30 : 42.2),
    duration: inferDuration(runType, distance || (runType === "trail" ? 30 : 42.2)),
    eventTime: inferEventTime(text),
    pace
  };
}

function inferDistance(text) {
  const kmMatch = text.match(/(\d+(?:\.\d+)?)\s?(?:km|公里|千米)/i);
  if (kmMatch) return Number(kmMatch[1]);
  if (/半马|半程/.test(text)) return 21.1;
  if (/全马|马拉松/.test(text)) return 42.2;
  if (/百公里/.test(text)) return 100;
  return null;
}

function inferDuration(runType, distance) {
  if (!distance) return "用时待确认";
  if (runType === "road") {
    if (distance <= 5) return "20-35分钟";
    if (distance <= 10) return "45-70分钟";
    if (distance <= 22) return "1.5-2.5小时";
    return "3.5-5小时";
  }
  if (distance <= 15) return "1.5-3小时";
  if (distance <= 25) return "3-5小时";
  if (distance <= 50) return "6-10小时";
  return "18小时以上";
}

function inferEventTime(text) {
  const dateMatch = text.match(/(20\d{2}[年/-]\d{1,2}[月/-]\d{1,2}日?)/);
  const timeMatch = text.match(/(\d{1,2}:\d{2})/);
  if (dateMatch && timeMatch) return `${dateMatch[1]} ${timeMatch[1]}`;
  if (dateMatch) return `${dateMatch[1]} 08:00`;
  if (timeMatch) return `比赛日 ${timeMatch[1]}`;
  return "比赛日 08:00";
}

function findKnownLocation(location) {
  return knownLocations.find((item) => item.keys.some((key) => location.includes(key)));
}

async function geocodeLocation(location) {
  const known = findKnownLocation(location);
  if (known) return known;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=zh&format=json`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Geocode failed: ${response.status}`);
    const data = await response.json();
    const first = data.results?.[0];
    if (!first) throw new Error("No geocode result");
    return {
      name: [first.country, first.admin1, first.name].filter(Boolean).join(" · "),
      latitude: first.latitude,
      longitude: first.longitude
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseWeatherTime(value) {
  if (!value || /待确认|比赛日|周末|今天/.test(value)) return null;
  const normalized = value
    .replace("年", "-")
    .replace("月", "-")
    .replace("日", "")
    .replace(/\//g, "-");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function chooseWeatherPoint(hourly, eventTime) {
  if (!hourly?.time?.length) return null;
  const target = eventTime ? eventTime.getTime() : Date.now();
  let bestIndex = 0;
  let bestDiff = Infinity;

  hourly.time.forEach((time, index) => {
    const diff = Math.abs(new Date(time).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = index;
    }
  });

  return {
    time: hourly.time[bestIndex],
    temperature: hourly.temperature_2m?.[bestIndex],
    humidity: hourly.relative_humidity_2m?.[bestIndex],
    precipitation: hourly.precipitation?.[bestIndex],
    cloudCover: hourly.cloud_cover?.[bestIndex],
    windSpeed: hourly.wind_speed_10m?.[bestIndex]
  };
}

function mapWeatherToForm(point, locationInfo, eventTime) {
  const rain = point.precipitation >= 2 ? "heavy-rain" : point.precipitation > 0 ? "rain" : "dry";
  const wind = point.windSpeed >= 20 ? "wind" : "calm";
  const hour = new Date(point.time).getHours();
  const sun = hour < 6 || hour >= 19 ? "night" : point.cloudCover >= 70 ? "cloudy" : "sun";

  return {
    location: locationInfo.name,
    temp: Math.round(point.temperature),
    humidity: Math.round(point.humidity),
    wind,
    rain,
    sun,
    sourceTime: point.time,
    source: eventTime ? "Open-Meteo 小时预报" : "Open-Meteo 当前/近期天气"
  };
}

async function getWeather(location, eventTimeText) {
  const locationInfo = await geocodeLocation(location);
  const eventTime = parseWeatherTime(eventTimeText);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", locationInfo.latitude);
    url.searchParams.set("longitude", locationInfo.longitude);
    url.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m");
    url.searchParams.set("forecast_days", "16");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Weather failed: ${response.status}`);
    const data = await response.json();
    const point = chooseWeatherPoint(data.hourly, eventTime);
    if (!point) throw new Error("No weather point");
    return {
      ok: true,
      ...mapWeatherToForm(point, locationInfo, eventTime)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function inferLocation(text) {
  const candidates = ["北京香山", "香山", "杭州", "上海", "北京", "崇礼", "张家口", "无锡", "厦门", "武汉", "成都", "广州", "深圳", "南京", "苏州", "莫干山", "黄山"];
  const hit = candidates.find((name) => text.includes(name));
  if (hit === "北京香山" || hit === "香山") return "北京 · 香山";
  return hit || "比赛地点待确认";
}

async function searchRace(query) {
  const fallback = fallbackScenes.find((item) => item.keywords.some((keyword) => query.includes(keyword)));
  const searchQuery = `${query} 比赛 马拉松 越野跑 路线 距离 官网`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 GearMind local prototype",
        Accept: "text/html"
      }
    });
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const html = await response.text();
    const sources = extractDuckDuckGoResults(html);
    const scene = classifyRace(query, sources);
    const sourceSummary = sources.slice(0, 3).map((item) => item.title).filter(Boolean).join(" / ");
    return {
      ok: true,
      provider: "DuckDuckGo HTML",
      name: sources[0]?.title || fallback?.name || query,
      scene: sources.length ? scene : fallback?.scene || scene,
      confidence: sources.length ? 0.74 : 0.48,
      evidence: sources.length ? `根据搜索结果推断：${sourceSummary}` : fallback?.evidence || "未检索到明确结果，已使用关键词规则兜底。",
      sources
    };
  } catch (error) {
    const scene = fallback?.scene || classifyRace(query, []);
    return {
      ok: false,
      provider: "local fallback",
      name: fallback?.name || query,
      scene,
      confidence: fallback ? 0.62 : 0.38,
      evidence: fallback?.evidence || `后台搜索暂时不可用：${error.message}。已使用关键词规则兜底。`,
      sources: []
    };
  } finally {
    clearTimeout(timeout);
  }
}

const mandatoryGearFallbacks = [
  {
    keywords: ["uto", "UTO", "首百", "香山", "北京香山", "越野训练赛"],
    title: "越野训练赛强制装备",
    sourceType: "fallback",
    source: "未检索到官方清单，按北京香山中距离越野训练赛通用安全要求生成，需以官方发布为准。",
    items: ["手机", "急救毯", "口哨", "头灯或备用照明", "不少于 500ml 水", "能量补给", "防风/保温外层"]
  },
  {
    keywords: ["崇礼168", "崇礼", "168"],
    title: "长距离越野强制装备",
    sourceType: "fallback",
    source: "未检索到官方清单，按百公里/超长距离越野通用强装生成，需以官方发布为准。",
    items: ["防水外套", "保温层", "头灯", "备用电池", "救生毯", "急救包", "手机", "水具", "能量补给"]
  }
];

function extractMandatoryGearItems(text) {
  const candidates = [
    "手机",
    "号码布",
    "水具",
    "水壶",
    "软水壶",
    "越野背包",
    "头灯",
    "备用电池",
    "救生毯",
    "急救毯",
    "保温毯",
    "急救包",
    "口哨",
    "防水外套",
    "冲锋衣",
    "保暖衣",
    "保温层",
    "雨衣",
    "手套",
    "帽子",
    "能量胶",
    "能量补给",
    "食物",
    "现金",
    "身份证",
    "充电宝",
    "GPS",
    "导航设备"
  ];
  return [...new Set(candidates.filter((item) => text.includes(item)))];
}

async function searchMandatoryGear(query, scene = {}) {
  const fallback = mandatoryGearFallbacks.find((item) =>
    item.keywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase()))
  );
  const searchQuery = `${query} 强制装备 必备装备 竞赛规程 参赛手册 mandatory gear`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 GearMind local prototype",
        Accept: "text/html"
      }
    });
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const html = await response.text();
    const sources = extractDuckDuckGoResults(html);
    const sourceText = sources.map((item) => `${item.title} ${item.snippet}`).join(" ");
    const items = extractMandatoryGearItems(sourceText);
    const officialish = sources.find((item) => /规程|手册|须知|官方|报名|参赛|强制装备|必备装备/i.test(`${item.title} ${item.snippet}`));

    if (items.length) {
      return {
        ok: true,
        title: "官方/公开资料强制装备",
        sourceType: officialish ? "searched-official-likely" : "searched",
        source: officialish?.title || sources[0]?.title || "搜索结果",
        sourceUrl: officialish?.url || sources[0]?.url || "",
        items,
        confidence: officialish ? 0.78 : 0.58,
        note: officialish ? "已从疑似官方规程/参赛资料中提取，仍建议赛前核对原文。" : "已从公开搜索摘要中提取，建议以官方原文为准。",
        sources
      };
    }

    if (fallback) {
      return {
        ok: false,
        confidence: 0.48,
        ...fallback,
        note: "搜索未提取到明确强制装备条目，已使用兜底清单。"
      };
    }

    return {
      ok: false,
      title: "通用越野强制装备",
      sourceType: "fallback",
      source: "未找到官方强制装备清单，按距离和越野场景生成兜底建议。",
      confidence: 0.35,
      items:
        scene.detail === "trail-ultra" || Number(scene.distance) >= 50
          ? ["防水外套", "保温层", "头灯", "备用电池", "救生毯", "急救包", "手机", "水具", "能量补给"]
          : ["手机", "急救毯", "口哨", "头灯或备用照明", "水具", "能量补给", "防风/保温外层"],
      note: "请以赛事官方发布的竞赛规程或参赛手册为准。"
    };
  } catch (error) {
    const fallbackItems = fallback || {
      title: "通用越野强制装备",
      sourceType: "fallback",
      source: `强制装备搜索暂时不可用：${error.message}。已使用通用兜底清单，需以官方发布为准。`,
      items: ["手机", "急救毯", "口哨", "头灯或备用照明", "水具", "能量补给", "防风/保温外层"]
    };
    return {
      ok: false,
      confidence: fallback ? 0.48 : 0.32,
      note: "搜索失败，已使用兜底清单。",
      ...fallbackItems
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, service: "gearmind" }));
    return;
  }

  if (url.pathname === "/api/race-search") {
    const query = (url.searchParams.get("q") || "").trim();
    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing q" }));
      return;
    }
    const result = await searchRace(query);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
    return;
  }

  if (url.pathname === "/api/weather") {
    const location = (url.searchParams.get("location") || "").trim();
    const eventTime = (url.searchParams.get("eventTime") || "").trim();
    if (!location) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing location" }));
      return;
    }

    try {
      const result = await getWeather(location, eventTime);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: error.message }));
    }
    return;
  }

  if (url.pathname === "/api/mandatory-gear") {
    const query = (url.searchParams.get("q") || "").trim();
    const detail = (url.searchParams.get("detail") || "").trim();
    const distance = Number(url.searchParams.get("distance") || 0);
    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing q" }));
      return;
    }

    const result = await searchMandatoryGear(query, { detail, distance });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, host, () => {
  console.log(`GearMind running at http://${host}:${port}`);
});
