const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

loadLocalEnv();

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

function loadLocalEnv() {
  const envPath = path.join(root, ".env");
  if (!fsSync.existsSync(envPath)) return;
  const content = fsSync.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

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

const gearFallbacks = [
  {
    keywords: ["vaporfly", "nike", "飞马", "碳板", "跑鞋", "shoe"],
    candidate: {
      category: "鞋子",
      brand: "Nike",
      model: "Vaporfly 3",
      material: "Flyknit 工程网眼 + ZoomX 泡棉，需确认年份和配色版本",
      weight: "约 180-220g，随尺码变化",
      positioning: "路跑竞速 / 半马全马",
      scenarios: ["路跑", "比赛", "半马", "全马"],
      attributes: ["缓震", "推进", "轻量"],
      confidence: 0.68,
      note: "图片名或关键词命中 Nike/Vaporfly/跑鞋。Vaporfly 同款年份和配色差异较多，需用户确认。"
    }
  },
  {
    keywords: ["salomon", "adv", "skin", "hydration", "vest", "背包", "越野包"],
    candidate: {
      category: "背包",
      brand: "Salomon",
      model: "Adv Skin",
      material: "弹力网布 + 尼龙，容量版本需确认",
      weight: "容量/尺码不同，需确认",
      positioning: "越野跑补给背心 / 强制装备携带",
      scenarios: ["越野跑", "中长距离", "强制装备"],
      attributes: ["容量", "稳定", "补给"],
      confidence: 0.64,
      note: "图片名或关键词命中 Salomon/Adv Skin/背包。Adv Skin 有 5/8/12 等容量和年份差异。"
    }
  },
  {
    keywords: ["oakley", "sunglasses", "glasses", "墨镜", "眼镜"],
    candidate: {
      category: "眼部",
      brand: "Oakley",
      model: "运动墨镜",
      material: "镜片和镜架材质需确认",
      weight: "待补全",
      positioning: "强日晒训练 / 越野 / 骑行",
      scenarios: ["强日晒", "越野", "骑行"],
      attributes: ["防晒", "视野", "防风"],
      confidence: 0.58,
      note: "图片名或关键词命中 Oakley/墨镜。镜片版本和年份容易混淆，需确认。"
    }
  },
  {
    keywords: ["jacket", "shirt", "singlet", "tee", "衣", "背心", "短袖", "长袖", "皮肤衣"],
    candidate: {
      category: "上身",
      brand: "",
      model: "",
      material: "速干聚酯 / 弹力面料，需确认吊牌或商品页",
      weight: "待补全",
      positioning: "跑步上身层",
      scenarios: ["训练", "比赛", "日常"],
      attributes: ["透气", "速干", "轻量"],
      confidence: 0.46,
      note: "按上身装备关键词推断。服装同款配色、面料版本差异大，建议手动确认。"
    }
  },
  {
    keywords: ["cap", "hat", "visor", "帽"],
    candidate: {
      category: "头部",
      brand: "",
      model: "",
      material: "速干面料，需确认",
      weight: "待补全",
      positioning: "跑步帽 / 遮阳控汗",
      scenarios: ["训练", "比赛", "日晒"],
      attributes: ["遮阳", "速干", "防风"],
      confidence: 0.46,
      note: "按头部装备关键词推断。帽檐、空顶帽、鸭舌帽需要用户确认。"
    }
  }
];

function findGearFallback(text) {
  const lower = text.toLowerCase();
  return gearFallbacks.find((item) => item.keywords.some((keyword) => lower.includes(keyword.toLowerCase())));
}

function makeGenericGearCandidate(fileName = "") {
  return {
    category: "鞋子",
    brand: "",
    model: "",
    material: "待用户确认",
    weight: "待补全",
    positioning: "日常训练 / 比赛待确认",
    scenarios: ["训练", "日常"],
    attributes: ["待识别"],
    confidence: 0.32,
    note: `未从 ${fileName || "照片"} 中获得高可信特征，已生成低可信度候选。`
  };
}

function parseDataUrl(dataUrl = "") {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mediaType: match[1],
    data: match[2]
  };
}

function extractFirstJSONObject(text = "") {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeVisionCandidate(value = {}, fallback) {
  return {
    category: value.category || fallback.category,
    brand: value.brand || fallback.brand || "",
    model: value.model || fallback.model || "",
    material: value.material || fallback.material,
    weight: value.weight || fallback.weight,
    positioning: value.positioning || fallback.positioning,
    scenarios: Array.isArray(value.scenarios) ? value.scenarios : fallback.scenarios,
    attributes: Array.isArray(value.attributes) ? value.attributes : fallback.attributes,
    confidence: typeof value.confidence === "number" ? Math.max(0, Math.min(1, value.confidence)) : fallback.confidence,
    note: value.note || fallback.note
  };
}

function buildGearVisionPrompt(fileName) {
  return [
    "你是 GearMind 的运动装备图片识别模型。请看图片，识别这件装备，并只输出 JSON，不要输出 Markdown。",
    "目标是“AI 猜测 + 用户确认”，不要假装百分百确定。同款不同年份、配色、版本容易识别错时，请在 note 里提醒。",
    "如果看不清品牌或型号，请留空，不要编造。",
    "",
    `图片文件名：${fileName || "未知"}`,
    "",
    "JSON 字段必须是：",
    "{",
    '  "category": "鞋子|上身|头部|背包|眼部|配件",',
    '  "brand": "品牌，无法确定则空字符串",',
    '  "model": "型号，无法确定则空字符串",',
    '  "material": "面料/材质猜测，无法确定则写待确认",',
    '  "weight": "重量/容量猜测，无法确定则写待补全",',
    '  "positioning": "装备定位，例如越野竞速鞋/路跑训练鞋/补给背心",',
    '  "scenarios": ["适用场景，最多4个"],',
    '  "attributes": ["装备属性，最多5个"],',
    '  "confidence": 0.0,',
    '  "note": "为什么这么猜，以及需要用户确认什么"',
    "}"
  ].join("\n");
}

function buildRaceImagePrompt(fileName) {
  return [
    "你是 GearMind 的比赛海报、路线图、天气截图和运动场景图片识别模型。请看图片，并只输出 JSON，不要输出 Markdown。",
    "目标是帮助用户快速建立场景输入。不要假装百分百确定；如果图片信息不足，请给低 confidence，并在 note 里提醒用户确认。",
    "如果图片是装备照片，也要识别出它不是比赛信息，并尽量推断适合的运动场景。",
    "",
    `图片文件名：${fileName || "未知"}`,
    "",
    "枚举要求：",
    "- sport: running|cycling|fitness|hiking|daily",
    "- runType: road|trail，仅 sport=running 时使用",
    "- detail: road-5k|road-10k|road-half|road-marathon|interval|lsd|recovery|trail-short|trail-mid|trail-long|trail-ultra",
    "- wind: calm|wind|strong",
    "- rain: dry|drizzle|rain|storm",
    "- sun: sunny|cloudy|night",
    "",
    "JSON 字段必须是：",
    "{",
    '  "imageType": "比赛海报|路线图|天气截图|装备照片|户外场景|不确定",',
    '  "name": "比赛/线路/场景名称，无法确定则写待确认图片场景",',
    '  "scene": {',
    '    "mode": "race|training|commute|travel|daily",',
    '    "sport": "running|cycling|fitness|hiking|daily",',
    '    "runType": "road|trail",',
    '    "detail": "上面的 detail 枚举之一",',
    '    "temp": 14,',
    '    "humidity": 70,',
    '    "wind": "calm|wind|strong",',
    '    "rain": "dry|drizzle|rain|storm",',
    '    "sun": "sunny|cloudy|night",',
    '    "altitude": 20,',
    '    "location": "地点，无法确定则写地点待确认",',
    '    "distance": 0,',
    '    "duration": "预计用时或待确认",',
    '    "eventTime": "比赛/出发时间或待确认",',
    '    "pace": "目标强度/场景策略"',
    "  },",
    '  "gearFocus": ["装备重点，最多6个"],',
    '  "confidence": 0.0,',
    '  "note": "为什么这么判断，以及用户需要确认什么"',
    "}"
  ].join("\n");
}

function normalizeRaceImageResult(value = {}, fallbackScene) {
  const scene = value.scene || {};
  return {
    ok: true,
    provider: "MiniMax M3 vision",
    name: value.name || "待确认图片场景",
    imageType: value.imageType || "不确定",
    confidence: typeof value.confidence === "number" ? Math.max(0, Math.min(1, value.confidence)) : 0.4,
    gearFocus: Array.isArray(value.gearFocus) ? value.gearFocus.slice(0, 6) : [],
    evidence: value.note || "已根据图片内容推断场景，请确认后使用。",
    scene: makeScene({
      ...fallbackScene,
      mode: scene.mode || fallbackScene.mode,
      sport: scene.sport || fallbackScene.sport,
      runType: scene.runType || fallbackScene.runType,
      detail: scene.detail || fallbackScene.detail,
      temp: typeof scene.temp === "number" ? scene.temp : fallbackScene.temp,
      humidity: typeof scene.humidity === "number" ? scene.humidity : fallbackScene.humidity,
      wind: scene.wind || fallbackScene.wind,
      rain: scene.rain || fallbackScene.rain,
      sun: scene.sun || fallbackScene.sun,
      altitude: typeof scene.altitude === "number" ? scene.altitude : fallbackScene.altitude,
      location: scene.location || fallbackScene.location,
      distance: typeof scene.distance === "number" ? scene.distance : fallbackScene.distance,
      duration: scene.duration || fallbackScene.duration,
      eventTime: scene.eventTime || fallbackScene.eventTime,
      pace: scene.pace || fallbackScene.pace
    })
  };
}

async function identifyRaceImage(payload = {}) {
  const image = parseDataUrl(payload.imageDataUrl || "");
  if (!image) throw new Error("缺少可识别的图片数据");

  const config = getMiniMaxConfig();
  if (!config.apiKey) throw new Error("未配置 MINIMAX_API_KEY");

  const fallbackScene = makeScene({
    mode: "race",
    sport: "running",
    runType: "trail",
    detail: "trail-mid",
    temp: 10,
    humidity: 65,
    wind: "wind",
    rain: "dry",
    sun: "cloudy",
    altitude: 650,
    location: "地点待确认",
    distance: 20,
    duration: "3-4小时",
    eventTime: "时间待确认",
    pace: "图片识别场景，保守携带"
  });
  const prompt = buildRaceImagePrompt(payload.fileName || "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const usesResponsesApi = config.baseUrl.includes("/responses");
    const usesAnthropicApi = config.baseUrl.includes("/anthropic/");
    const requestBody = usesAnthropicApi
      ? {
          model: config.model,
          max_tokens: 1000,
          system: "你是严谨的运动比赛图片识别助手，只输出 JSON。",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: image.mediaType,
                    data: image.data
                  }
                },
                { type: "text", text: prompt }
              ]
            }
          ],
          thinking: { type: "disabled" }
        }
      : usesResponsesApi
      ? {
          model: config.model,
          instructions: "你是严谨的运动比赛图片识别助手，只输出 JSON。",
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                { type: "input_image", image_url: payload.imageDataUrl }
              ]
            }
          ],
          max_output_tokens: 1000
        }
      : {
          model: config.model,
          messages: [
            { role: "system", content: "你是严谨的运动比赛图片识别助手，只输出 JSON。" },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: payload.imageDataUrl,
                    detail: "default"
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          thinking: { type: "disabled" }
        };

    const response = await fetch(config.baseUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(usesAnthropicApi
          ? {
              "X-Api-Key": config.apiKey,
              "anthropic-version": "2023-06-01"
            }
          : {
              Authorization: `Bearer ${config.apiKey}`
            })
      },
      body: JSON.stringify(requestBody)
    });
    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.base_resp?.status_msg || text || `MiniMax race image failed: ${response.status}`);
    }

    const content =
      data?.output_text ||
      data?.content?.find?.((item) => item.type === "text")?.text ||
      data?.choices?.[0]?.message?.content ||
      data?.reply ||
      text;
    const parsed = extractFirstJSONObject(String(content));
    if (!parsed) throw new Error("MiniMax M3 未返回可解析 JSON");
    return normalizeRaceImageResult(parsed, fallbackScene);
  } finally {
    clearTimeout(timeout);
  }
}

async function runMiniMaxGearVision(payload = {}) {
  const config = getMiniMaxConfig();
  if (!config.apiKey) throw new Error("未配置 MINIMAX_API_KEY");

  const image = parseDataUrl(payload.imageDataUrl || "");
  if (!image) throw new Error("缺少可识别的图片数据");

  const prompt = buildGearVisionPrompt(payload.fileName || "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const usesResponsesApi = config.baseUrl.includes("/responses");
    const usesAnthropicApi = config.baseUrl.includes("/anthropic/");
    const requestBody = usesAnthropicApi
      ? {
          model: config.model,
          max_tokens: 900,
          system: "你是严谨的运动装备识别助手，只输出 JSON。",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: image.mediaType,
                    data: image.data
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ],
          thinking: {
            type: "disabled"
          }
        }
      : usesResponsesApi
      ? {
          model: config.model,
          instructions: "你是严谨的运动装备识别助手，只输出 JSON。",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: prompt
                },
                {
                  type: "input_image",
                  image_url: payload.imageDataUrl
                }
              ]
            }
          ],
          temperature: 0.2,
          max_output_tokens: 900
        }
      : {
          model: config.model,
          messages: [
            {
              role: "system",
              content: "你是严谨的运动装备识别助手，只输出 JSON。"
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: payload.imageDataUrl
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 900
        };

    const response = await fetch(config.baseUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(usesAnthropicApi
          ? {
              "X-Api-Key": config.apiKey,
              "anthropic-version": "2023-06-01"
            }
          : {
              Authorization: `Bearer ${config.apiKey}`
            })
      },
      body: JSON.stringify(requestBody)
    });
    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || data?.base_resp?.status_msg || text || `MiniMax vision failed: ${response.status}`);
    }

    const content =
      data?.output_text ||
      data?.content?.find?.((item) => item.type === "text")?.text ||
      data?.choices?.[0]?.message?.content ||
      data?.reply ||
      text;
    const parsed = extractFirstJSONObject(String(content));
    if (!parsed) throw new Error("MiniMax M3 未返回可解析 JSON");
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

async function identifyGear(payload = {}) {
  const fileName = payload.fileName || "";
  const fallback = findGearFallback(fileName)?.candidate || makeGenericGearCandidate(fileName);
  try {
    const visionCandidate = await runMiniMaxGearVision(payload);
    return {
      ok: true,
      provider: "MiniMax M3 vision",
      candidate: {
        ...normalizeVisionCandidate(visionCandidate, fallback),
        source: "MiniMax M3 图片识别",
        note: `${visionCandidate.note || fallback.note} 请确认品牌、型号、年份、配色和版本后再入库。`
      }
    };
  } catch (error) {
    return {
      ok: false,
      provider: "MiniMax M3 vision fallback",
      error: error.message,
      candidate: {
        ...fallback,
        source: "MiniMax M3 识别失败后的本地兜底",
        note: `MiniMax M3 图片识别失败：${error.message}。${fallback.note} 请手动确认后入库。`
      }
    };
  }
}

function inferGearFromSearch(query, category, sources) {
  const text = `${query} ${sources.map((item) => `${item.title} ${item.snippet}`).join(" ")}`;
  const fallback = findGearFallback(text)?.candidate || makeGenericGearCandidate(query);
  const materialHints = [];
  if (/flyknit|mesh|网眼|工程网眼/i.test(text)) materialHints.push("工程网眼 / 透气织面");
  if (/zoomx|foam|泡棉|eva/i.test(text)) materialHints.push("高回弹泡棉");
  if (/nylon|尼龙|ripstop|防撕裂/i.test(text)) materialHints.push("尼龙 / 防撕裂面料");
  if (/polyester|聚酯|速干/i.test(text)) materialHints.push("速干聚酯");

  const weightMatch = text.match(/(\d{2,4}\s?(?:g|克)|\d+(?:\.\d+)?\s?L|\d+(?:\.\d+)?升)/i);
  const officialish = sources.find((item) => /官网|官方|旗舰店|商品|product|review|评测|参数/i.test(`${item.title} ${item.snippet}`));

  return {
    ...fallback,
    category: category || fallback.category,
    material: materialHints.length ? [...new Set(materialHints)].join(" + ") : fallback.material,
    weight: weightMatch?.[0] || fallback.weight,
    source: officialish?.title || sources[0]?.title || "公开搜索摘要",
    sourceUrl: officialish?.url || sources[0]?.url || "",
    confidence: sources.length ? Math.max(fallback.confidence || 0.4, officialish ? 0.72 : 0.58) : fallback.confidence,
    note: sources.length
      ? "已根据公开搜索摘要补全面料、重量或定位。商品同款不同年份/配色/版本仍需用户确认。"
      : "未找到明确公开资料，保留本地猜测。"
  };
}

async function completeGearInfo(query, category) {
  const searchQuery = `${query} ${category || ""} 商品 参数 重量 面料 适用场景 review`;
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
    return {
      ok: true,
      provider: "DuckDuckGo HTML",
      candidate: inferGearFromSearch(query, category, sources),
      sources
    };
  } catch (error) {
    const fallback = findGearFallback(query)?.candidate || makeGenericGearCandidate(query);
    return {
      ok: false,
      provider: "local fallback",
      candidate: {
        ...fallback,
        category: category || fallback.category,
        source: "公开资料搜索失败后的本地兜底",
        note: `搜索公开商品信息失败：${error.message}。请手动确认后入库。`
      },
      sources: []
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getMiniMaxConfig() {
  const cleanToken = (value = "") => value.trim().replace(/^<|>$/g, "");
  const normalizeBaseUrl = (value = "") => {
    const baseUrl = value.trim().replace(/\/+$/g, "");
    if (!baseUrl) return "https://api.minimaxi.com/v1/chat/completions";
    if (baseUrl.endsWith("/v1")) return `${baseUrl}/chat/completions`;
    if (baseUrl.endsWith("/anthropic")) return `${baseUrl}/v1/messages`;
    return baseUrl;
  };

  return {
    apiKey: cleanToken(process.env.MINIMAX_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || ""),
    model: process.env.MINIMAX_MODEL || process.env.ANTHROPIC_MODEL || "MiniMax-M3",
    baseUrl: normalizeBaseUrl(process.env.MINIMAX_API_BASE_URL || process.env.OPENAI_BASE_URL || process.env.ANTHROPIC_BASE_URL || "")
  };
}

function buildAssistantPrompt(taskType, payload = {}) {
  const scene = payload.scene || {};
  const gear = Array.isArray(payload.gear) ? payload.gear : [];
  const mandatory = payload.mandatoryGear || null;
  const sceneText = [
    `场景：${scene.mode || "race"}`,
    `运动：${scene.sport || "running"}`,
    `跑步类型：${scene.runType || "unknown"}`,
    `细分：${scene.detail || "unknown"}`,
    `地点：${scene.location || "待确认"}`,
    `距离：${scene.distance || "待确认"}km`,
    `预计用时：${scene.duration || "待确认"}`,
    `天气：${scene.temp || "?"}°C，湿度${scene.humidity || "?"}%，风力${scene.wind || "?"}，降雨${scene.rain || "?"}，日晒${scene.sun || "?"}，海拔${scene.altitude || "?"}m`,
    `目标：${scene.pace || "待确认"}`
  ].join("\n");
  const gearText = gear.map((item) => `- ${item.name || "未知装备"}：${item.meta || item.tags || ""}`).join("\n") || "暂无装备库";
  const mandatoryText = mandatory?.items?.length
    ? `强制装备：${mandatory.items.join("、")}\n来源：${mandatory.source || "待确认"}`
    : "强制装备：暂无官方清单";

  const taskPrompts = {
    rules: "请基于当前场景生成 4 条装备搭配规则。每条包含：规则名、触发条件、推荐动作、风险提醒。语言要短、产品化、适合直接展示在网页。",
    "gear-card-copy": "请生成 3 张游戏装备卡片文案。每张包含：装备名、稀有度、核心属性、适用场景、短描述、购买/不购买判断。不要编造具体品牌价格。",
    "mandatory-gear-review": "请审核强制装备和补给是否足够。输出：必带清单、建议补给节奏、缺口、赛前确认事项。必须标注官方清单不明确时需要用户二次确认。"
  };

  return [
    "你是 GearMind 智能装备助手的 MiniMax M3 子任务模型。",
    "你的任务是为主模型准备候选内容，主模型会审核后再合并。",
    "不要输出 Markdown 表格。不要使用夸张营销语。不要给医疗建议。",
    "请用中文输出，结构清晰，信息密度高。",
    "",
    `任务：${taskPrompts[taskType] || taskPrompts.rules}`,
    "",
    sceneText,
    "",
    "用户已有装备：",
    gearText,
    "",
    mandatoryText
  ].join("\n");
}

async function parseJSONBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (Buffer.concat(chunks).length > 8 * 1024 * 1024) {
      throw new Error("Request body too large");
    }
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function runMiniMaxTask(taskType, payload) {
  const config = getMiniMaxConfig();
  if (!config.apiKey) {
    return {
      ok: false,
      needsConfig: true,
      provider: "MiniMax M3",
      message: "未配置 MINIMAX_API_KEY。请在本地 .env 或云平台环境变量中配置后重启服务。"
    };
  }

  const prompt = buildAssistantPrompt(taskType, payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const usesResponsesApi = config.baseUrl.includes("/responses");
    const usesAnthropicApi = config.baseUrl.includes("/anthropic/");
    const requestBody = usesAnthropicApi
      ? {
          model: config.model,
          max_tokens: 900,
          system: "你是严谨的运动装备产品助手，只输出可供主模型审核的候选内容。",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          thinking: {
            type: "disabled"
          }
        }
      : usesResponsesApi
      ? {
          model: config.model,
          instructions: "你是严谨的运动装备产品助手，只输出可供主模型审核的候选内容。",
          input: prompt,
          temperature: 0.4,
          max_output_tokens: 900,
          reasoning: {
            effort: "none"
          }
        }
      : {
          model: config.model,
          messages: [
            {
              role: "system",
              content: "你是严谨的运动装备产品助手，只输出可供主模型审核的候选内容。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 900
        };

    const response = await fetch(config.baseUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(usesAnthropicApi
          ? {
              "X-Api-Key": config.apiKey,
              "anthropic-version": "2023-06-01"
            }
          : {
              Authorization: `Bearer ${config.apiKey}`
            })
      },
      body: JSON.stringify(requestBody)
    });
    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || data?.base_resp?.status_msg || text || `MiniMax request failed: ${response.status}`);
    }

    const content =
      data?.output_text ||
      data?.content?.find?.((item) => item.type === "text")?.text ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.delta?.content ||
      data?.reply ||
      text;

    return {
      ok: true,
      provider: "MiniMax M3",
      model: config.model,
      taskType,
      content: String(content).trim(),
      raw: data
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

  if (url.pathname === "/api/gear-identify" && req.method === "POST") {
    try {
      const body = await parseJSONBody(req);
      const result = await identifyGear(body);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: error.message }));
    }
    return;
  }

  if (url.pathname === "/api/race-image-identify" && req.method === "POST") {
    try {
      const body = await parseJSONBody(req);
      const result = await identifyRaceImage(body);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, provider: "MiniMax M3 vision", error: error.message }));
    }
    return;
  }

  if (url.pathname === "/api/gear-complete") {
    const query = (url.searchParams.get("q") || "").trim();
    const category = (url.searchParams.get("category") || "").trim();
    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing q" }));
      return;
    }

    const result = await completeGearInfo(query, category);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
    return;
  }

  if (url.pathname === "/api/assistant-task" && req.method === "POST") {
    if (process.env.ENABLE_DEV_ASSISTANT !== "true") {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Developer assistant is disabled" }));
      return;
    }

    try {
      const body = await parseJSONBody(req);
      const taskType = body.taskType || "rules";
      const result = await runMiniMaxTask(taskType, body.payload || {});
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, provider: "MiniMax M3", error: error.message }));
    }
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, host, () => {
  console.log(`GearMind running at http://${host}:${port}`);
});
