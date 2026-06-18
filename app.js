const gearItems = [
  {
    name: "Nike Vaporfly 3",
    meta: "路跑 · 全马 · 中长距离 · 缓震",
    icon: "footprints",
    slot: "鞋子",
    rarity: "Epic",
    rarityLabel: "史诗",
    image: "https://source.unsplash.com/800x1000/?red-running-shoes",
    stats: [
      ["缓震", 88],
      ["推进", 92],
      ["稳定", 68]
    ],
    tags: ["全马", "竞速", "路跑"]
  },
  {
    name: "Salomon Adv Skin 12",
    meta: "越野 · 中长距离 · 容量 12L",
    icon: "backpack",
    slot: "背包",
    rarity: "Legendary",
    rarityLabel: "传说",
    image: "https://source.unsplash.com/800x1000/?hydration-vest,trail-running",
    stats: [
      ["容量", 92],
      ["稳定", 86],
      ["补给", 90]
    ],
    tags: ["越野", "强装", "12L"]
  },
  {
    name: "轻量速干背心",
    meta: "上身 · 速干 · 透气 · 12-28°C",
    icon: "shirt",
    slot: "上身",
    rarity: "Rare",
    rarityLabel: "稀有",
    image: "https://source.unsplash.com/800x1000/?running-singlet",
    stats: [
      ["透气", 90],
      ["速干", 88],
      ["保暖", 24]
    ],
    tags: ["夏季", "比赛", "高强度"]
  },
  {
    name: "防风跑步帽",
    meta: "头部 · 防风 · 小雨 · 比赛等待",
    icon: "badge",
    slot: "头部",
    rarity: "Rare",
    rarityLabel: "稀有",
    image: "https://source.unsplash.com/800x1000/?running-cap",
    stats: [
      ["防风", 72],
      ["遮阳", 70],
      ["收纳", 82]
    ],
    tags: ["小雨", "开阔路", "起跑等待"]
  },
  {
    name: "Oakley 运动墨镜",
    meta: "眼部 · 强日晒 · 日常训练",
    icon: "glasses",
    slot: "眼部",
    rarity: "Epic",
    rarityLabel: "史诗",
    image: "https://source.unsplash.com/800x1000/?sports-sunglasses",
    stats: [
      ["防晒", 94],
      ["视野", 86],
      ["防风", 62]
    ],
    tags: ["强日晒", "越野", "骑行"]
  }
];

const detailOptions = {
  race: {
    road: [
      ["road-5k", "5K"],
      ["road-10k", "10K"],
      ["road-half", "半马"],
      ["road-marathon", "全马"]
    ],
    trail: [
      ["trail-short", "短距离"],
      ["trail-mid", "中距离"],
      ["trail-long", "长距离"],
      ["trail-ultra", "百公里 / 超长距离"]
    ]
  },
  training: {
    road: [
      ["road-5k", "5K"],
      ["road-10k", "10K"],
      ["interval", "间歇跑"],
      ["lsd", "LSD"],
      ["recovery", "恢复跑"]
    ],
    trail: [
      ["trail-short", "短距离"],
      ["trail-mid", "中距离"],
      ["trail-long", "长距离"],
      ["trail-ultra", "百公里 / 超长距离"]
    ]
  },
  daily: {
    road: [
      ["commute", "通勤"],
      ["travel", "旅行"],
      ["daily-walk", "日常"]
    ],
    trail: [
      ["travel", "旅行"],
      ["daily-walk", "日常"]
    ]
  }
};

const outfitRules = {
  "road-5k": {
    sport: "路跑 · 5K",
    strategy: "轻量散热，减少负担",
    items: [
      ["头部", "空顶帽", "短距离强度高，主要处理汗水和日晒。", "badge", "#3f6f4b"],
      ["上身", "轻量背心", "快速排汗，避免多余外层影响配速。", "shirt", "#2f6275"],
      ["下身", "竞速短裤", "摆腿自由，减少摩擦。", "panel-bottom", "#d67531"],
      ["鞋子", "短距离竞速鞋", "优先轻量和响应，不必追求长距离缓震。", "footprints", "#a4463d"]
    ]
  },
  "road-10k": {
    sport: "路跑 · 10K",
    strategy: "速度优先，兼顾控汗",
    items: [
      ["头部", "速干跑帽", "压住汗水和碎发，强日晒时更稳。", "badge", "#3f6f4b"],
      ["上身", "短袖或背心", "保留散热，避免雨天厚外套。", "shirt", "#2f6275"],
      ["下身", "运动短裤", "轻量灵活，适合高强度节奏。", "panel-bottom", "#d67531"],
      ["鞋子", "中短距离竞速鞋", "响应和稳定比极限缓震更重要。", "footprints", "#a4463d"]
    ]
  },
  "road-half": {
    sport: "路跑 · 半马",
    strategy: "轻量优先，保留一点防风",
    items: [
      ["头部", "空顶帽", "控汗和遮雨，减少额头进水。", "badge", "#3f6f4b"],
      ["上身", "短袖或背心", "半马时间更短，避免外层过热。", "shirt", "#2f6275"],
      ["下身", "运动短裤", "轻量灵活，适合比赛节奏。", "panel-bottom", "#d67531"],
      ["鞋子", "竞速训练鞋", "比全马鞋更灵活，适合较高强度。", "footprints", "#a4463d"]
    ]
  },
  "road-marathon": {
    sport: "路跑 · 全马",
    strategy: "开跑偏冷，后程防闷",
    items: [
      ["头部", "防风跑步帽", "雨天起跑等待更稳，后程可塞进腰包。", "badge", "#3f6f4b"],
      ["上身", "速干背心 + 轻量皮肤衣", "核心层排汗，外层挡风雨，避免穿厚冲锋衣。", "shirt", "#2f6275"],
      ["下身", "双层压缩短裤", "减少摩擦，长距离比普通短裤更稳妥。", "panel-bottom", "#d67531"],
      ["鞋子", "中长距离碳板跑鞋", "缓震和推进兼顾，适合目标配速稳定输出。", "footprints", "#a4463d"]
    ]
  },
  interval: {
    sport: "路跑 · 间歇跑",
    strategy: "热身保暖，主训练散热",
    items: [
      ["头部", "薄款跑步帽", "热身期防风，组间休息不容易凉。", "badge", "#3f6f4b"],
      ["上身", "长袖速干层", "高强度出汗多，避免棉质或厚外套。", "shirt", "#2f6275"],
      ["下身", "压缩短裤", "提升活动自由度，减少摆腿阻碍。", "panel-bottom", "#d67531"],
      ["鞋子", "轻量速度训练鞋", "响应快，适合短距离重复冲刺。", "footprints", "#a4463d"]
    ]
  },
  lsd: {
    sport: "路跑 · LSD",
    strategy: "舒适耐用，补给可达",
    items: [
      ["头部", "透气跑帽", "长时间户外训练，控汗和防晒更重要。", "badge", "#3f6f4b"],
      ["上身", "短袖 + 可收纳外层", "强度低但时间长，温差要留余量。", "shirt", "#2f6275"],
      ["携带", "腰包或小背包", "放手机、能量胶和薄外套。", "briefcase", "#d67531"],
      ["鞋子", "长距离缓震训练鞋", "保护优先，不必上最激进竞速鞋。", "footprints", "#a4463d"]
    ]
  },
  recovery: {
    sport: "路跑 · 恢复跑",
    strategy: "保暖舒适，降低刺激",
    items: [
      ["头部", "薄帽或发带", "低强度出汗少，避免跑完受凉。", "badge", "#3f6f4b"],
      ["上身", "长袖速干层", "舒适保暖，体感比速度更重要。", "shirt", "#2f6275"],
      ["下身", "运动长裤", "低心率训练可适当保暖。", "panel-bottom", "#d67531"],
      ["鞋子", "缓震慢跑鞋", "降低冲击，帮助恢复。", "footprints", "#a4463d"]
    ]
  },
  "trail-short": {
    sport: "越野跑 · 短距离",
    strategy: "轻量抓地，减少携带",
    items: [
      ["头部", "遮阳帽", "山路明暗变化大，控汗和遮阳都要有。", "badge", "#3f6f4b", "https://source.unsplash.com/800x600/?running-cap"],
      ["上身", "速干短袖", "爬升出汗多，优先透气。", "shirt", "#2f6275", "https://source.unsplash.com/800x600/?running-shirt"],
      ["携带", "软水壶腰包", "短距离保留水和手机即可。", "briefcase", "#d67531", "https://source.unsplash.com/800x600/?running-belt"],
      ["鞋子", "短距离越野鞋", "抓地和灵活优先。", "footprints", "#a4463d", "https://source.unsplash.com/800x600/?trail-running-shoes"],
      ["补给", "软水壶 + 能量胶", "20km 内建议至少 500ml 水、1-2 支能量胶或电解质。", "droplets", "#3f6f4b", "https://source.unsplash.com/800x600/?energy-gel,running"],
      ["强制装备", "手机 + 急救毯 + 口哨", "短距离也要保留基础安全件，尤其山地线路信号不稳定。", "shield-check", "#2f6275", "https://source.unsplash.com/800x600/?first-aid-kit,outdoor"]
    ]
  },
  "trail-mid": {
    sport: "越野跑 · 中距离",
    strategy: "抓地和携带优先",
    items: [
      ["头部", "遮阳帽", "林道和开阔路段都能覆盖。", "badge", "#3f6f4b", "https://source.unsplash.com/800x600/?running-cap,trail"],
      ["上身", "短袖 + 防风皮肤衣", "爬升降温明显，外层要容易收纳。", "shirt", "#2f6275", "https://source.unsplash.com/800x600/?trail-running-jacket"],
      ["携带", "8-12L 越野背包", "补给、水、强制装备都需要稳定携带。", "backpack", "#d67531", "https://source.unsplash.com/800x600/?hydration-vest,trail-running"],
      ["鞋子", "中距离越野鞋", "抓地、防护和脚感平衡。", "footprints", "#a4463d", "https://source.unsplash.com/800x600/?trail-running-shoes"],
      ["补给", "水 1-1.5L + 能量胶/盐丸", "20km、3-4 小时建议按每 45 分钟一份能量补给，另带电解质。", "utensils", "#3f6f4b", "https://source.unsplash.com/800x600/?sports-nutrition,energy-gel"],
      ["强制装备", "急救毯 + 头灯 + 手机 + 口哨", "训练赛也按比赛标准准备，山地环境优先保证失温、照明和求救能力。", "shield-check", "#2f6275", "https://source.unsplash.com/800x600/?headlamp,first-aid,outdoor"]
    ]
  },
  "trail-long": {
    sport: "越野跑 · 长距离",
    strategy: "安全冗余，夜间和失温优先",
    items: [
      ["头部", "帽子 + 头灯", "长距离要考虑夜间和突发天气。", "flashlight", "#3f6f4b", "https://source.unsplash.com/800x600/?headlamp,trail-running"],
      ["上身", "长袖速干 + 防水外套", "低温、风雨、停留时间都要留余量。", "shirt", "#2f6275", "https://source.unsplash.com/800x600/?waterproof-running-jacket"],
      ["携带", "12L 以上越野背包", "容量要覆盖补给、保温层和强制装备。", "backpack", "#d67531", "https://source.unsplash.com/800x600/?hydration-pack,trail"],
      ["鞋子", "长距离越野鞋", "优先稳定、防护和耐久，不只看轻量。", "footprints", "#a4463d", "https://source.unsplash.com/800x600/?trail-shoes"],
      ["补给", "分段补给 + 备用热量", "按每小时 40-60g 碳水准备，额外带一份备用能量和电解质。", "utensils", "#3f6f4b", "https://source.unsplash.com/800x600/?running-nutrition"],
      ["强制装备", "防水外套 + 保温层 + 急救包", "长距离要准备失温、摔伤、夜间和天气突变的冗余装备。", "shield-check", "#2f6275", "https://source.unsplash.com/800x600/?outdoor-emergency-kit"]
    ]
  },
  "trail-ultra": {
    sport: "越野跑 · 百公里 / 超长距离",
    strategy: "安全冗余，强制装备完整",
    items: [
      ["头部", "帽子 + 头灯 + 备用电池", "夜间、失温和低能见度都要覆盖。", "flashlight", "#3f6f4b", "https://source.unsplash.com/800x600/?headlamp,ultrarunning"],
      ["上身", "长袖速干 + 防水外套 + 保温层", "超长距离要按最坏天气留余量。", "shirt", "#2f6275", "https://source.unsplash.com/800x600/?trail-running-jacket"],
      ["携带", "12-15L 越野背包", "水、补给、急救、保温和强制装备要稳定分仓。", "backpack", "#d67531", "https://source.unsplash.com/800x600/?ultramarathon-vest"],
      ["鞋子", "长距离保护型越野鞋", "稳定、防护、耐磨优先于极限轻量。", "footprints", "#a4463d", "https://source.unsplash.com/800x600/?ultra-trail-shoes"],
      ["补给", "全程补给计划 + 备用胃口方案", "按站点拆分能量胶、咸味食物、电解质和咖啡因，避免只靠甜食。", "utensils", "#3f6f4b", "https://source.unsplash.com/800x600/?ultrarunning-nutrition"],
      ["强制装备", "完整强装包 + 备用照明", "防水外套、保温层、急救、头灯、备用电池、救生毯和充电设备都要确认。", "shield-check", "#2f6275", "https://source.unsplash.com/800x600/?emergency-gear,hiking"]
    ]
  },
  commute: {
    sport: "日常 · 通勤",
    strategy: "舒适耐看，天气适配",
    items: [
      ["头部", "轻便帽", "应对小雨和日晒，不影响日常造型。", "badge", "#3f6f4b"],
      ["上身", "防泼水外套", "通勤场景优先便利和耐脏。", "shirt", "#2f6275"],
      ["携带", "日常背包", "容量覆盖电脑、水杯和更换衣物。", "backpack", "#d67531"],
      ["鞋子", "缓震通勤鞋", "走路舒适，兼顾轻运动。", "footprints", "#a4463d"]
    ]
  },
  travel: {
    sport: "日常 · 旅行",
    strategy: "一衣多用，轻量易收纳",
    items: [
      ["头部", "可折叠帽", "轻量好收纳，覆盖日晒和小雨。", "badge", "#3f6f4b"],
      ["上身", "速干层 + 轻外套", "减少行李数量，适配温差。", "shirt", "#2f6275"],
      ["携带", "轻量背包", "容量和重量平衡，适合全天移动。", "backpack", "#d67531"],
      ["鞋子", "全地形步行鞋", "兼顾城市路面和轻徒步。", "footprints", "#a4463d"]
    ]
  },
  "daily-walk": {
    sport: "日常",
    strategy: "舒适优先，按天气微调",
    items: [
      ["头部", "帽子或墨镜", "根据日晒和风力选择。", "glasses", "#3f6f4b"],
      ["上身", "透气上衣", "保持体感干爽。", "shirt", "#2f6275"],
      ["携带", "小包", "只带必要物品。", "briefcase", "#d67531"],
      ["鞋子", "舒适缓震鞋", "步行友好，避免过硬竞速鞋。", "footprints", "#a4463d"]
    ]
  }
};

const rainCopy = {
  rain: "小雨",
  dry: "无雨",
  "heavy-rain": "大雨"
};

const inferredSearchScenes = [
  {
    keywords: ["杭州马拉松", "杭马", "杭州全马"],
    name: "杭州马拉松",
    source: "后台搜索：城市马拉松赛事",
    mode: "race",
    sport: "running",
    runType: "road",
    detail: "road-marathon",
    temp: 12,
    humidity: 78,
    wind: "calm",
    rain: "rain",
    sun: "cloudy",
    altitude: 20,
    location: "杭州 · 西湖区",
    distance: 42.2,
    duration: "3小时45分",
    eventTime: "2026-11-01 07:30",
    pace: "全马 3:45，稳妥完赛",
    note: "已匹配：路跑 · 全马。建议确认比赛日期后自动拉取逐小时天气。"
  },
  {
    keywords: ["上海半马", "上海半程", "上马半马"],
    name: "上海半程马拉松",
    source: "后台搜索：城市半程马拉松",
    mode: "race",
    sport: "running",
    runType: "road",
    detail: "road-half",
    temp: 16,
    humidity: 70,
    wind: "calm",
    rain: "dry",
    sun: "cloudy",
    altitude: 8,
    location: "上海 · 浦东新区",
    distance: 21.1,
    duration: "1小时45分",
    eventTime: "2026-04-19 07:00",
    pace: "半马比赛，目标稳定输出",
    note: "已匹配：路跑 · 半马。建议关注湿度和起跑等待温度。"
  },
  {
    keywords: ["崇礼168", "崇礼", "168"],
    name: "崇礼168 超长距离越野",
    source: "后台搜索：山地越野赛事",
    mode: "race",
    sport: "running",
    runType: "trail",
    detail: "trail-ultra",
    temp: 8,
    humidity: 62,
    wind: "wind",
    rain: "rain",
    sun: "cloudy",
    altitude: 1800,
    location: "张家口 · 崇礼",
    distance: 100,
    duration: "18-28小时",
    eventTime: "2026-07-18 06:00",
    pace: "百公里 / 超长距离，安全完赛",
    note: "已匹配：越野跑 · 百公里/超长距离。建议重点检查强制装备、保温层和夜间照明。"
  },
  {
    keywords: ["uto", "UTO", "首百", "香山", "北京香山", "越野训练赛"],
    name: "UTO助力首百越野训练赛 · 北京香山",
    source: "本地关键词识别：UTO/首百/北京香山",
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
    location: "北京 · 香山",
    distance: 20,
    duration: "3-4小时",
    eventTime: "比赛日 08:00",
    pace: "越野训练赛，按中距离保守携带",
    note: "已识别：越野跑 · 中距离训练赛。建议确认官方距离和出发时间。"
  },
  {
    keywords: ["莫干山", "越野线路", "山地线路", "爬升线路"],
    name: "山地越野线路",
    source: "后台搜索：线路地形识别",
    mode: "training",
    sport: "running",
    runType: "trail",
    detail: "trail-mid",
    temp: 14,
    humidity: 82,
    wind: "wind",
    rain: "rain",
    sun: "cloudy",
    altitude: 650,
    location: "山地线路 · 中等爬升",
    distance: 30,
    duration: "4-6小时",
    eventTime: "周末 08:00",
    pace: "越野中距离训练，保守携带",
    note: "已识别：越野跑 · 中距离线路。建议关注抓地、防水、防风和背包容量。"
  },
  {
    keywords: ["间歇", "操场", "400米", "速度课"],
    name: "路跑间歇训练",
    source: "后台搜索：训练线路/课表",
    mode: "training",
    sport: "running",
    runType: "road",
    detail: "interval",
    temp: 18,
    humidity: 58,
    wind: "calm",
    rain: "dry",
    sun: "night",
    altitude: 20,
    location: "操场 / 城市路跑线路",
    distance: 8,
    duration: "60分钟",
    eventTime: "今天 19:30",
    pace: "间歇跑，热身后进入高强度",
    note: "已识别：路跑 · 间歇跑。训练场景下会优先推荐散热和速度训练鞋。"
  }
];

const outfitGrid = document.querySelector("#outfitGrid");
const gearList = document.querySelector("#gearList");
const toast = document.querySelector("#toast");
const sportCategorySelect = document.querySelector("#sportCategorySelect");
const runTypeSelect = document.querySelector("#runTypeSelect");
const runDetailSelect = document.querySelector("#runDetailSelect");
const runningFields = document.querySelector("#runningFields");
const tempInput = document.querySelector("#tempInput");
const humidityInput = document.querySelector("#humidityInput");
const windSelect = document.querySelector("#windSelect");
const rainSelect = document.querySelector("#rainSelect");
const sunSelect = document.querySelector("#sunSelect");
const altitudeInput = document.querySelector("#altitudeInput");
const weatherStatus = document.querySelector("#weatherStatus");
const locationInput = document.querySelector("#locationInput");
const distanceInput = document.querySelector("#distanceInput");
const durationInput = document.querySelector("#durationInput");
const eventTimeInput = document.querySelector("#eventTimeInput");
const paceInput = document.querySelector("#paceInput");
const summaryWeather = document.querySelector("#summaryWeather");
const summarySport = document.querySelector("#summarySport");
const summaryDistance = document.querySelector("#summaryDistance");
const summaryStrategy = document.querySelector("#summaryStrategy");
const reasonText = document.querySelector("#reasonText");
const rulesList = document.querySelector("#rulesList");
const feedbackButtons = document.querySelector("#feedbackButtons");
const feedbackStatus = document.querySelector("#feedbackStatus");
const profileGrid = document.querySelector("#profileGrid");
const raceSearchInput = document.querySelector("#raceSearchInput");
const raceDetectResult = document.querySelector("#raceDetectResult");
const raceImageInput = document.querySelector("#raceImageInput");
const raceImagePreview = document.querySelector("#raceImagePreview");
const racePreviewImage = document.querySelector("#racePreviewImage");
const raceImageName = document.querySelector("#raceImageName");

let activeMode = "race";
let searchDebounceTimer;
let weatherDebounceTimer;
let latestSearchScene = null;
let latestSearchKeyword = "";
let mandatoryGearResult = null;
let preferenceProfile = loadPreferenceProfile();
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function loadPreferenceProfile() {
  const fallback = {
    warmthBias: 1,
    rainRisk: 1,
    carryBias: 1,
    feedbackCount: 0,
    lastFeedback: "暂无"
  };

  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem("gearmind-preference-profile") || "{}")
    };
  } catch {
    return fallback;
  }
}

function savePreferenceProfile() {
  localStorage.setItem("gearmind-preference-profile", JSON.stringify(preferenceProfile));
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}

function findSceneFromKeyword(keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return null;
  return inferredSearchScenes.find((scene) =>
    scene.keywords.some((item) => normalized.includes(item.toLowerCase()))
  );
}

function normalizeBackendScene(result, keyword) {
  if (!result || !result.scene) return null;
  const providerLabel = result.ok === false ? "关键词识别兜底" : `全网搜索：${result.provider || "搜索服务"}`;
  return {
    keywords: [keyword],
    name: result.name || keyword,
    source: providerLabel,
    mode: result.scene.mode || "race",
    sport: result.scene.sport || "running",
    runType: result.scene.runType || "road",
    detail: result.scene.detail || "road-marathon",
    temp: result.scene.temp ?? 14,
    humidity: result.scene.humidity ?? 70,
    wind: result.scene.wind || "calm",
    rain: result.scene.rain || "dry",
    sun: result.scene.sun || "cloudy",
    altitude: result.scene.altitude ?? 20,
    location: result.scene.location || "比赛地点待确认",
    distance: result.scene.distance ?? "",
    duration: result.scene.duration || "",
    eventTime: result.scene.eventTime || "",
    pace: result.scene.pace || "比赛日，稳妥完赛",
    note: `${result.evidence || "已根据搜索结果推断比赛类型。"} 可信度 ${Math.round((result.confidence || 0.5) * 100)}%。`
  };
}

async function searchRaceFromBackend(keyword) {
  if (window.location.protocol === "file:") return null;
  const response = await fetch(`/api/race-search?q=${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error("race search failed");
  return response.json();
}

async function updateWeatherFromBackend() {
  if (window.location.protocol === "file:") {
    weatherStatus.textContent = "当前是 file:// 打开，无法调用后台实时天气。请使用 http://127.0.0.1:4173";
    return;
  }

  const location = locationInput.value.trim();
  if (!location) return;

  weatherStatus.textContent = "正在联网更新温度、湿度、风力、降雨和日晒...";
  try {
    const response = await fetch(
      `/api/weather?location=${encodeURIComponent(location)}&eventTime=${encodeURIComponent(eventTimeInput.value.trim())}`
    );
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "weather failed");

    tempInput.value = result.temp;
    humidityInput.value = result.humidity;
    setSelectValue(windSelect, result.wind);
    setSelectValue(rainSelect, result.rain);
    setSelectValue(sunSelect, result.sun);
    if (result.location) locationInput.value = result.location;
    weatherStatus.textContent = `${result.source}已更新：${result.sourceTime} · ${result.location}`;
    renderRecommendation();
  } catch (error) {
    weatherStatus.textContent = `实时天气更新失败，保留当前天气值：${error.message}`;
  }
}

async function updateMandatoryGearFromBackend(scene, keyword) {
  if (!scene || scene.runType !== "trail") {
    mandatoryGearResult = null;
    renderRecommendation();
    return;
  }

  mandatoryGearResult = {
    loading: true,
    title: "正在搜索官方强制装备",
    source: "正在检索竞赛规程、参赛手册和强制装备清单...",
    items: []
  };
  renderRecommendation();

  if (window.location.protocol === "file:") {
    mandatoryGearResult = {
      ok: false,
      title: "强制装备待官方确认",
      sourceType: "fallback",
      source: "当前是 file:// 打开，无法调用后台搜索。请使用 http://127.0.0.1:4173。",
      items: ["手机", "急救毯", "口哨", "头灯或备用照明", "水具", "能量补给", "防风/保温外层"]
    };
    renderRecommendation();
    return;
  }

  try {
    const response = await fetch(
      `/api/mandatory-gear?q=${encodeURIComponent(keyword || scene.name)}&detail=${encodeURIComponent(scene.detail || "")}&distance=${encodeURIComponent(scene.distance || "")}`
    );
    mandatoryGearResult = await response.json();
  } catch (error) {
    mandatoryGearResult = {
      ok: false,
      title: "强制装备搜索失败",
      sourceType: "fallback",
      source: `搜索失败：${error.message}。已使用通用兜底清单，需以官方发布为准。`,
      items: ["手机", "急救毯", "口哨", "头灯或备用照明", "水具", "能量补给", "防风/保温外层"]
    };
  }
  renderRecommendation();
}

function scheduleWeatherUpdate() {
  clearTimeout(weatherDebounceTimer);
  weatherDebounceTimer = setTimeout(updateWeatherFromBackend, 500);
}

function setActiveMode(mode) {
  activeMode = mode;
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function setSelectValue(select, value) {
  select.value = value;
  if (select.value !== value) {
    select.selectedIndex = 0;
  }
}

function applyInferredScene(scene) {
  latestSearchScene = scene;
  setActiveMode(scene.mode);
  setSelectValue(sportCategorySelect, scene.sport);
  setSelectValue(runTypeSelect, scene.runType);
  syncDetailOptions();
  setSelectValue(runDetailSelect, scene.detail);
  tempInput.value = scene.temp;
  humidityInput.value = scene.humidity;
  setSelectValue(windSelect, scene.wind);
  setSelectValue(rainSelect, scene.rain);
  setSelectValue(sunSelect, scene.sun);
  altitudeInput.value = scene.altitude;
  locationInput.value = scene.location;
  distanceInput.value = scene.distance || "";
  durationInput.value = scene.duration || "";
  eventTimeInput.value = scene.eventTime || "";
  paceInput.value = scene.pace;
  renderRecommendation();
  scheduleWeatherUpdate();
}

function renderSearchConfirmation(scene, keyword, status = "已自动填入场景") {
  latestSearchScene = scene;
  latestSearchKeyword = keyword || scene.name;
  const safeKeyword = escapeHTML(keyword || scene.name);
  const distance = scene.distance ? `${scene.distance}km` : "待确认";
  const duration = scene.duration || "待确认";
  const eventTime = scene.eventTime || "待确认";
  const runTypeLabel = scene.runType === "trail" ? "越野跑" : "路跑";
  const detailLabels = {
    "road-5k": "5K",
    "road-10k": "10K",
    "road-half": "半马",
    "road-marathon": "全马",
    "trail-short": "短距离",
    "trail-mid": "中距离",
    "trail-long": "长距离",
    "trail-ultra": "百公里 / 超长距离",
    interval: "间歇跑",
    lsd: "LSD",
    recovery: "恢复跑"
  };
  const detailLabel = detailLabels[scene.detail] || scene.detail || "待确认";

  raceDetectResult.innerHTML = `
    <div class="race-info-card">
      <div class="race-info-head">
        <span>${status}</span>
        <strong>${escapeHTML(scene.name)}</strong>
      </div>
      <div class="race-info-grid">
        <div><span>类型</span><strong>${runTypeLabel} · ${detailLabel}</strong></div>
        <div><span>距离</span><strong>${distance}</strong></div>
        <div><span>预计用时</span><strong>${escapeHTML(duration)}</strong></div>
        <div><span>比赛 / 出发时间</span><strong>${escapeHTML(eventTime)}</strong></div>
        <div><span>地点</span><strong>${escapeHTML(scene.location || "待确认")}</strong></div>
        <div><span>海拔</span><strong>${scene.altitude || "待确认"}m</strong></div>
      </div>
      <p>${escapeHTML(scene.source)} · ${escapeHTML(scene.note)} · 搜索词：${safeKeyword}</p>
    </div>
    <div class="confirm-actions">
      <button type="button" data-confirm-search>正确，使用这个</button>
      <button class="ghost" type="button" data-reject-search>不对，我手动改</button>
    </div>
  `;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderGear() {
  gearList.innerHTML = gearItems
    .map(
      (item, index) => `
        <article class="gear-card ${item.rarity.toLowerCase()}" data-gear-index="${index}" tabindex="0">
          <div class="gear-card-art">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
            <span class="gear-rarity">${item.rarityLabel}</span>
            <span class="gear-slot"><i data-lucide="${item.icon}"></i>${item.slot}</span>
          </div>
          <div class="gear-card-body">
            <div class="gear-card-title">
              <strong>${item.name}</strong>
              <span>${item.meta}</span>
            </div>
            <div class="gear-stats">
              ${item.stats
                .map(
                  ([label, value]) => `
                    <div>
                      <span>${label}</span>
                      <b>${value}</b>
                      <i style="width:${value}%"></i>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="gear-tags">
              ${item.tags.map((tag) => `<em>${tag}</em>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function addDemoGear() {
  const nextGear = {
    name: "新上传装备",
    meta: "待识别 · AI 正在补全标签",
    icon: "sparkles",
    slot: "待识别",
    rarity: "Rare",
    rarityLabel: "待鉴定",
    image: "https://source.unsplash.com/800x1000/?running-gear",
    stats: [
      ["匹配", 42],
      ["资料", 30],
      ["可信", 36]
    ],
    tags: ["待识别", "照片上传", "AI标记"]
  };

  gearItems.unshift(nextGear);
  renderGear();
  showToast("已添加一张装备卡，等待 AI 识别品牌、型号和属性。");
}

function syncDetailOptions() {
  const options = detailOptions[activeMode][runTypeSelect.value] || detailOptions.race.road;
  runDetailSelect.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

function getRuleKey() {
  const sport = sportCategorySelect.value;
  if (sport === "running") return runDetailSelect.value;
  if (sport === "cycling") return activeMode === "daily" ? "commute" : "road-10k";
  if (sport === "fitness") return "recovery";
  if (sport === "hiking") return "trail-mid";
  return "daily-walk";
}

function getActiveRuleInsights() {
  const temp = Number(tempInput.value);
  const distance = Number(distanceInput.value || 0);
  const isTrail = runTypeSelect.value === "trail";
  const rain = rainSelect.value;
  const insights = [];

  if (temp <= 10 || preferenceProfile.warmthBias > 1) {
    insights.push(["体感保暖", `温度 ${temp}°C，且你的保暖偏好为 +${preferenceProfile.warmthBias}，外层优先可收纳防风。`]);
  } else {
    insights.push(["散热优先", `温度 ${temp}°C，当前不需要厚保暖层，核心层优先速干透气。`]);
  }

  if (rain !== "dry" || preferenceProfile.rainRisk > 1) {
    insights.push(["雨天风险", `降雨/雨天保守系数为 +${preferenceProfile.rainRisk}，推荐防风防泼水外层和帽檐。`]);
  }

  if (isTrail) {
    insights.push(["越野安全", "越野场景默认加入补给和强制装备；官方强制装备会优先覆盖通用建议。"]);
  }

  if (distance >= 20 || preferenceProfile.carryBias > 1) {
    insights.push(["携带容量", `距离 ${distance || "待确认"}km，携带偏好 +${preferenceProfile.carryBias}，背包容量和补给可达性优先。`]);
  }

  return insights.slice(0, 4);
}

function renderRulesAndProfile() {
  rulesList.innerHTML = getActiveRuleInsights()
    .map(
      ([title, body]) => `
        <article>
          <strong>${title}</strong>
          <span>${body}</span>
        </article>
      `
    )
    .join("");

  profileGrid.innerHTML = [
    ["怕冷指数", `${preferenceProfile.warmthBias}/3`],
    ["雨天保守", `${preferenceProfile.rainRisk}/3`],
    ["携带冗余", `${preferenceProfile.carryBias}/3`],
    ["反馈次数", `${preferenceProfile.feedbackCount}`],
    ["上次反馈", preferenceProfile.lastFeedback]
  ]
    .map(
      ([label, value]) => `
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

function applyFeedback(type) {
  const labels = {
    cold: "太冷",
    hot: "太热",
    good: "刚好",
    missing: "缺装备"
  };

  if (type === "cold") preferenceProfile.warmthBias = Math.min(3, preferenceProfile.warmthBias + 1);
  if (type === "hot") preferenceProfile.warmthBias = Math.max(0, preferenceProfile.warmthBias - 1);
  if (type === "missing") preferenceProfile.carryBias = Math.min(3, preferenceProfile.carryBias + 1);
  if (type === "good") {
    preferenceProfile.rainRisk = Math.max(0, preferenceProfile.rainRisk - 0);
  }

  if (rainSelect.value !== "dry" && type === "cold") {
    preferenceProfile.rainRisk = Math.min(3, preferenceProfile.rainRisk + 1);
  }

  preferenceProfile.feedbackCount += 1;
  preferenceProfile.lastFeedback = labels[type] || "已反馈";
  savePreferenceProfile();
  feedbackStatus.textContent = `已记录：${preferenceProfile.lastFeedback}。下一次推荐会调整保暖、携带和雨天风险权重。`;
  renderRecommendation();
}

function renderRecommendation() {
  const isRunning = sportCategorySelect.value === "running";
  runningFields.hidden = !isRunning;

  const rule = outfitRules[getRuleKey()] || outfitRules["road-marathon"];
  const temp = `${tempInput.value}°C`;
  const rain = rainCopy[rainSelect.value];
  const wind = windSelect.options[windSelect.selectedIndex].text;
  const sun = sunSelect.options[sunSelect.selectedIndex].text;
  const altitude = `${altitudeInput.value}m`;
  const distance = distanceInput.value ? `${distanceInput.value}km` : "距离待确认";
  const duration = durationInput.value || "用时待确认";
  const eventTime = eventTimeInput.value || "时间待确认";

  summaryWeather.textContent = `${temp} · 湿度${humidityInput.value}% · ${rain}`;
  summarySport.textContent = isRunning ? rule.sport : sportCategorySelect.options[sportCategorySelect.selectedIndex].text;
  summaryDistance.textContent = `${distance} · ${duration}`;
  summaryStrategy.textContent = rule.strategy;

  let items = rule.items;
  if (mandatoryGearResult && sportCategorySelect.value === "running" && runTypeSelect.value === "trail") {
    const gearItemsText = mandatoryGearResult.items?.length ? mandatoryGearResult.items.join("、") : "正在搜索官方清单";
    const sourceText = mandatoryGearResult.loading
      ? mandatoryGearResult.source
      : `${mandatoryGearResult.source || "来源待确认"}${mandatoryGearResult.note ? `。${mandatoryGearResult.note}` : ""}`;
    items = rule.items.map((item) =>
      item[0] === "强制装备"
        ? [
            "强制装备",
            mandatoryGearResult.title || "官方强制装备",
            `${gearItemsText}。来源：${sourceText}`,
            "shield-check",
            mandatoryGearResult.ok ? "#3f6f4b" : "#a4463d",
            item[5]
          ]
        : item
    );
  }

  outfitGrid.innerHTML = items
    .map(
      ([category, name, desc, icon, color, image]) => `
        <article class="outfit-card" style="--accent:${color}">
          ${image ? `<img class="outfit-photo" src="${image}" alt="${category} · ${name}" loading="lazy" />` : ""}
          <div class="outfit-content">
            <span class="icon"><i data-lucide="${icon}"></i></span>
            <h3>${category} · ${name}</h3>
            <p>${desc}</p>
          </div>
        </article>
      `
    )
    .join("");

  reasonText.textContent =
    rainSelect.value !== "dry"
      ? `${temp}、湿度${humidityInput.value}%、${wind}、${rain}、${sun}、海拔${altitude}、距离${distance}、预计${duration}、出发时间${eventTime}。当前核心矛盾是防雨防风和排汗透气的平衡，推荐优先使用可收纳外层和已经验证过的鞋服组合。`
      : `${temp}、湿度${humidityInput.value}%、${wind}、${sun}、海拔${altitude}、距离${distance}、预计${duration}、出发时间${eventTime}。推荐策略会优先考虑使用场景、目标强度和已有装备覆盖，减少临场纠结，并避免为了单次场景重复购买。`;

  renderRulesAndProfile();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveMode(button.dataset.mode);
    syncDetailOptions();
    renderRecommendation();
  });
});

sportCategorySelect.addEventListener("input", renderRecommendation);
runTypeSelect.addEventListener("input", () => {
  syncDetailOptions();
  renderRecommendation();
});

[runDetailSelect, tempInput, humidityInput, windSelect, rainSelect, sunSelect, altitudeInput, distanceInput, durationInput, eventTimeInput].forEach((input) => {
  input.addEventListener("input", renderRecommendation);
});

[locationInput, eventTimeInput].forEach((input) => {
  input.addEventListener("change", scheduleWeatherUpdate);
});

document.querySelector("#coldToggle").addEventListener("change", (event) => {
  preferenceProfile.warmthBias = event.target.checked ? Math.max(preferenceProfile.warmthBias, 1) : 0;
  savePreferenceProfile();
  renderRecommendation();
});

document.querySelector("#rainToggle").addEventListener("change", (event) => {
  preferenceProfile.rainRisk = event.target.checked ? Math.max(preferenceProfile.rainRisk, 1) : 0;
  savePreferenceProfile();
  renderRecommendation();
});

feedbackButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feedback]");
  if (!button) return;
  applyFeedback(button.dataset.feedback);
});

document.querySelector("#refreshBtn").addEventListener("click", renderRecommendation);
document.querySelector("#cameraUploadBtn").addEventListener("click", () => {
  raceImageInput.click();
  showToast("选择比赛海报、路线图或装备照片后，会进入识别流程。");
});

document.querySelector("#addGearBtn").addEventListener("click", addDemoGear);

gearList.addEventListener("click", (event) => {
  const card = event.target.closest(".gear-card");
  if (!card) return;
  document.querySelectorAll(".gear-card").forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");
  const gear = gearItems[Number(card.dataset.gearIndex)];
  showToast(`已选中装备：${gear.name}。可用于后续搭配和购买重叠分析。`);
});

gearList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const card = event.target.closest(".gear-card");
  if (card) card.click();
});

document.querySelector(".shopping-cards").addEventListener("click", (event) => {
  const card = event.target.closest("[data-cart-action]");
  if (!card) return;
  document.querySelectorAll(".shopping-cards article").forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");
  const messages = {
    need: "已标记为购买缺口：优先补齐轻量防风皮肤衣。",
    overlap: "已标记为功能重叠：购买前会和现有竞速鞋对比。",
    priority: "已加入优先清单：越野强制装备包会影响比赛安全。"
  };
  showToast(messages[card.dataset.cartAction]);
});

document.querySelector("#raceSearchBtn").addEventListener("click", async () => {
  const keyword = raceSearchInput.value.trim() || "杭州马拉松";
  raceDetectResult.innerHTML = `
    <span>后台搜索中</span>
    <strong>${escapeHTML(keyword)}</strong>
    <em>正在全网检索比赛官网、线路关键词、地形、距离和相关介绍，并同步更新下面的场景输入。</em>
  `;
  try {
    const result = await searchRaceFromBackend(keyword);
    const scene = normalizeBackendScene(result, keyword) || findSceneFromKeyword(keyword);
    if (!scene) {
      raceDetectResult.innerHTML = `
        <span>未匹配到明确比赛</span>
        <strong>${escapeHTML(keyword)}</strong>
        <em>请用 http://127.0.0.1:4173 打开页面以启用后台全网搜索，或补充距离/地点关键词后再试。不会再默认识别成杭州马拉松。</em>
      `;
      return;
    }
    applyInferredScene(scene);
    renderSearchConfirmation(scene, keyword, result ? "全网搜索后请确认" : "本地推断后请确认");
  } catch (error) {
    const scene = findSceneFromKeyword(keyword);
    if (!scene) {
      raceDetectResult.innerHTML = `
        <span>搜索失败，未使用默认比赛</span>
        <strong>${escapeHTML(keyword)}</strong>
        <em>后台不可用或当前是 file:// 打开。请切换到 http://127.0.0.1:4173，或者手动调整下面的场景输入。</em>
      `;
      return;
    }
    applyInferredScene(scene);
    renderSearchConfirmation(scene, keyword, "搜索失败，已用本地推断");
  }
});

raceSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#raceSearchBtn").click();
  }
});

document.querySelector("#imageDetectBtn").addEventListener("click", () => {
  raceDetectResult.innerHTML = `
    <span>图片识别</span>
    <strong>可能是越野跑 · 中距离 / 高海拔徒步赛事</strong>
    <em>画面包含山地、背包、户外路径。建议优先检查：抓地、防水、防风、背包容量、补给和强制装备。</em>
  `;
});

raceImageInput.addEventListener("change", () => {
  const file = raceImageInput.files[0];
  if (!file) return;

  racePreviewImage.src = URL.createObjectURL(file);
  raceImageName.textContent = file.name;
  raceImagePreview.hidden = false;
  raceDetectResult.innerHTML = `
    <span>图片已上传</span>
    <strong>正在识别比赛海报 / 路线图 / 装备照片</strong>
    <em>原型推断：如果图片含山地路线，优先匹配越野跑；如果含城市道路和赛事 Logo，优先匹配路跑比赛。</em>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

raceSearchInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const keyword = raceSearchInput.value.trim();
    if (keyword.length < 2) return;

    raceDetectResult.innerHTML = `
      <span>后台检索</span>
      <strong>${escapeHTML(keyword)}</strong>
      <em>正在判断这是路跑、越野跑、训练线路还是日常路线，并准备同步场景输入。</em>
    `;

    let scene = null;
    try {
      const result = await searchRaceFromBackend(keyword);
      scene = normalizeBackendScene(result, keyword);
    } catch {
      scene = null;
    }

    scene = scene || findSceneFromKeyword(keyword);
    if (!scene) {
      raceDetectResult.innerHTML = `
        <span>等待确认</span>
        <strong>${escapeHTML(keyword)}</strong>
        <em>暂未在原型库里匹配到明确比赛。后续接真实搜索后，会从比赛官网、路线图和天气数据中自动补全。</em>
      `;
      return;
    }

    applyInferredScene(scene);
    renderSearchConfirmation(scene, keyword, window.location.protocol === "file:" ? "本地推断后请确认" : "全网搜索后请确认");
  }, 700);
});

raceDetectResult.addEventListener("click", (event) => {
  if (event.target.matches("[data-confirm-search]")) {
    raceDetectResult.innerHTML = `
      <span>已确认</span>
      <strong>场景输入已锁定为当前比赛 / 线路</strong>
      <em>正在关联官方强制装备清单；如果找不到官方发布，会明确标记为兜底建议。</em>
    `;
    updateMandatoryGearFromBackend(latestSearchScene, latestSearchKeyword);
  }

  if (event.target.matches("[data-reject-search]")) {
    raceDetectResult.innerHTML = `
      <span>需要修正</span>
      <strong>请在下方场景输入里手动调整</strong>
      <em>真实版本会把你的修正反馈给搜索和识别模型，下次同类比赛会更准。</em>
    `;
  }
});

renderGear();
syncDetailOptions();
renderRecommendation();
