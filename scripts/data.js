export const CHINA_GEOJSON_URL = new URL("../data/china.geojson", import.meta.url).href;

export const capitals = [
  { province: "北京市", city: "北京", coord: [116.4074, 39.9042] },
  { province: "天津市", city: "天津", coord: [117.200983, 39.084158] },
  { province: "上海市", city: "上海", coord: [121.4737, 31.2304] },
  { province: "重庆市", city: "重庆", coord: [106.5516, 29.563] },
  { province: "河北省", city: "石家庄", coord: [114.5149, 38.0428] },
  { province: "山西省", city: "太原", coord: [112.5492, 37.857] },
  { province: "辽宁省", city: "沈阳", coord: [123.4315, 41.8057] },
  { province: "吉林省", city: "长春", coord: [125.3235, 43.8171] },
  { province: "黑龙江省", city: "哈尔滨", coord: [126.535, 45.8038] },
  { province: "江苏省", city: "南京", coord: [118.7969, 32.0603] },
  { province: "浙江省", city: "杭州", coord: [120.1551, 30.2741] },
  { province: "安徽省", city: "合肥", coord: [117.2272, 31.8206] },
  { province: "福建省", city: "福州", coord: [119.2965, 26.0745] },
  { province: "江西省", city: "南昌", coord: [115.8579, 28.682] },
  { province: "山东省", city: "济南", coord: [117.1201, 36.6512] },
  { province: "河南省", city: "郑州", coord: [113.6254, 34.7466] },
  { province: "湖北省", city: "武汉", coord: [114.3054, 30.5931] },
  { province: "湖南省", city: "长沙", coord: [112.9388, 28.2282] },
  { province: "广东省", city: "广州", coord: [113.2644, 23.1291] },
  { province: "海南省", city: "海口", coord: [110.1999, 20.044] },
  { province: "四川省", city: "成都", coord: [104.0665, 30.5728] },
  { province: "贵州省", city: "贵阳", coord: [106.6302, 26.647] },
  { province: "云南省", city: "昆明", coord: [102.8329, 24.8801] },
  { province: "陕西省", city: "西安", coord: [108.9398, 34.3416] },
  { province: "甘肃省", city: "兰州", coord: [103.8343, 36.0611] },
  { province: "青海省", city: "西宁", coord: [101.7782, 36.6171] },
  { province: "内蒙古自治区", city: "呼和浩特", coord: [111.7492, 40.8426] },
  { province: "广西壮族自治区", city: "南宁", coord: [108.3669, 22.817] },
  { province: "西藏自治区", city: "拉萨", coord: [91.1322, 29.6604] },
  { province: "宁夏回族自治区", city: "银川", coord: [106.2309, 38.4872] },
  { province: "新疆维吾尔自治区", city: "乌鲁木齐", coord: [87.6168, 43.8256] },
];

// 在这里填写你的真实完赛记录，键名使用城市名即可。
// 示例：
// 北京: { date: "2024.10.27", time: "03:46:21" }
// 杭州: { date: "2024.11.03", time: "03:42:18" }
// 半程赛事加 distance: "half"，地图上会写成“xx半程马拉松”，也不会被当成破三。
// 全马成绩快于 3:00:00 的省会会自动标成“破三”重点样式。
// tag 会挂在赛事名后面显示，用一个符号即可，例如 "⏱️"（PB）、"🐰"（官方配速员）。
// marathonResults 里的 bib 是号码布，陈列馆的完赛档案会显示，可不填。
export const completedMarathons = {
  兰州: { date: "2024.05.26", time: "03:58:06" },
  太原: { date: "2024.09.22", time: "03:18:17" },
  天津: { date: "2024.10.20", time: "03:04:53" },
  福州: { date: "2024.12.15", time: "03:14:39" },
  重庆: { date: "2025.03.02", time: "03:00:33" },
  武汉: { date: "2025.03.23", time: "03:13:54" },
  长春: { date: "2025.05.25", time: "03:44:57", tag: "🐰" },
  哈尔滨: { date: "2025.08.31", time: "03:30:17" },
  沈阳: { date: "2025.09.14", time: "03:14:20" },
  拉萨: { date: "2025.09.21", time: "01:59:55", distance: "half" },
  成都: { date: "2025.10.26", time: "03:09:54" },
  北京: { date: "2025.11.02", time: "02:59:13", tag: "⏱️" },
  南京: { date: "2025.11.16", time: "03:49:48" },
  昆明: { date: "2025.11.30", time: "03:26:32" },
  广州: { date: "2025.12.21", time: "03:24:21" },
  海口: { date: "2025.12.28", time: "03:26:28" },
  石家庄: { date: "2026.03.29", time: "03:24:16" },
  银川: { date: "2026.05.17", time: "03:19:09" },
  呼和浩特: { date: "2026.09.19", time: "03:18:25" },
};

// 头部成绩卡的数据；各项可填写成绩/分数和赛事，留空会显示“待填写”。
export const runnerProfile = {
  fullMarathonPb: {
    time: "02:59:13",
    event: "2025 北京马拉松",
    date: "2025.11.02",
  },
  halfMarathonPb: {
    time: "01:27:55",
    event: "2025 扬州鉴真半程马拉松",
    date: "2025.03.30",
  },
  itraPerformance: {
    score: "567",
    event: "2025 崇礼168 超级越野赛",
    date: "2025.07.14",
  },
  utmbPerformance: {
    score: "499",
    event: "2025 大境门 By UTMB",
    date: "2025.05.18",
  },
};

const majorRaceMedals = {
  重庆: new URL("../assets/2025重庆马拉松.webp", import.meta.url).href,
  武汉: new URL("../assets/2025武汉马拉松.webp", import.meta.url).href,
  北京: new URL("../assets/2025北京马拉松.webp", import.meta.url).href,
  广州: new URL("../assets/2025广州马拉松.webp", import.meta.url).href,
};

export const chinaMajorRaces = [
  {
    city: "重庆",
    event: "重庆马拉松",
    year: "2025",
    badge: "山城揭幕",
    accent: "#2c5b97",
    soft: "rgba(44, 91, 151, 0.16)",
    medalImage: majorRaceMedals.重庆,
  },
  {
    city: "武汉",
    event: "武汉马拉松",
    year: "2025",
    badge: "樱花江城",
    accent: "#8a3b3d",
    soft: "rgba(138, 59, 61, 0.16)",
    medalImage: majorRaceMedals.武汉,
  },
  {
    city: "北京",
    event: "北京马拉松",
    year: "2025",
    badge: "国马舞台",
    accent: "#b04734",
    soft: "rgba(176, 71, 52, 0.16)",
    medalImage: majorRaceMedals.北京,
  },
  {
    city: "广州",
    event: "广州马拉松",
    year: "2025",
    badge: "珠江水韵",
    accent: "#a97920",
    soft: "rgba(169, 121, 32, 0.16)",
    medalImage: majorRaceMedals.广州,
  },
];

// HYROX 组别进阶轨：出现在 hyroxRaces 里的组别会被标为已完成。
export const hyroxDivisions = [
  { code: "RELAY", label: "四人" },
  { code: "DOUBLES", label: "双人" },
  { code: "SINGLE", label: "单人" },
  { code: "PRO", label: "" },
];

// HYROX 赛事：每场 8 段跑 + 8 个站点，按比赛顺序排列（跑 1 → 站 1 → 跑 2 → 站 2 …）。
// rank 为全场排名，没有数据就省略，页面只显示用时。
// relay: true 表示接力赛，此时用 mine 标记柿子承担的站，其余站显示为队友承担。
// short 是手机端显示的两字站名。
export const hyroxRaces = [
  {
    division: "RELAY",
    divisionLabel: "男子四人接力",
    event: "HYROX 北京站",
    date: "2026.09.12",
    team: "柿子 & 3 位队友 · AG U40",
    time: "1:19:48",
    overall: { rank: 61, total: 197, percentile: "前 31%" },
    ageGroup: { rank: 48, total: 151 },
    splits: { run: "30:04", station: "42:56", roxzone: "6:52" },
    relay: true,
    runs: [
      { time: "3:34" },
      { time: "3:45" },
      { time: "3:38" },
      { time: "3:44" },
      { time: "3:27" },
      { time: "3:56" },
      { time: "3:50" },
      { time: "4:14" },
    ],
    stations: [
      { name: "滑雪机", short: "滑雪", time: "4:31" },
      { name: "推雪橇", short: "推橇", time: "4:25", rank: 124, mine: true },
      { name: "拉雪橇", short: "拉橇", time: "4:48" },
      { name: "波比跳", short: "波比", time: "7:14" },
      { name: "划船机", short: "划船", time: "4:51", rank: 70, mine: true },
      { name: "农夫行走", short: "农夫", time: "3:07" },
      { name: "沙袋弓步", short: "弓步", time: "7:34" },
      { name: "墙球", short: "墙球", time: "6:26" },
    ],
    footNote: "接力制：每人跑 2 段、做 2 站",
    rankNote: "分段排名为全场排名，仅柿子承担的两站有数据",
  },
  {
    division: "DOUBLES",
    divisionLabel: "Open 男子双人",
    event: "HYROX 北京站",
    date: "2026.09.13",
    team: "柿子 & 搭档 · AG 35–39",
    time: "1:19:53",
    overall: { rank: 351, total: 815, percentile: "前 44%" },
    ageGroup: { rank: 93, total: 218 },
    splits: { run: "34:06", station: "40:08", roxzone: "5:44" },
    runs: [
      { time: "4:02", rank: 126 },
      { time: "4:03", rank: 82 },
      { time: "4:16", rank: 72 },
      { time: "4:14", rank: 75 },
      { time: "4:10", rank: 50 },
      { time: "4:09", rank: 58 },
      { time: "4:15", rank: 65 },
      { time: "5:00", rank: 97 },
    ],
    stations: [
      { name: "滑雪机", short: "滑雪", time: "4:25", rank: 341 },
      { name: "推雪橇", short: "推橇", time: "4:08", rank: 410 },
      { name: "拉雪橇", short: "拉橇", time: "4:14", rank: 320 },
      { name: "波比跳", short: "波比", time: "5:28", rank: 387 },
      { name: "划船机", short: "划船", time: "5:13", rank: 323 },
      { name: "农夫行走", short: "农夫", time: "1:37", rank: 57 },
      { name: "沙袋弓步", short: "弓步", time: "4:02", rank: 209 },
      { name: "墙球", short: "墙球", time: "11:01", rank: 806 },
    ],
    medal: "🥈 商学院赛中赛 亚军",
    rankNote: "分段排名为全场排名",
  },
];

// 全部全程马拉松成绩（净计时），按日期排列，含非省会赛事。
// “全马 PB 路径”从这里算：按时间顺序每次刷新最好成绩就是一级台阶。
// 省会地图不读这里，仍读上面的 completedMarathons；两边都要维护。
export const marathonResults = [
  { date: "2023.11.12", event: "泰安马拉松", time: "03:40:58", bib: "A11264" },
  { date: "2024.03.24", event: "无锡马拉松", time: "03:14:33", bib: "E27692" },
  { date: "2024.05.26", event: "兰州马拉松", time: "03:58:06", bib: "A24822" },
  { date: "2024.09.22", event: "太原马拉松", time: "03:18:17", bib: "A2478" },
  { date: "2024.10.20", event: "天津马拉松", time: "03:04:53", bib: "A1128" },
  { date: "2024.11.03", event: "北京马拉松", time: "03:13:09", bib: "B0650" },
  { date: "2024.12.15", event: "福州马拉松", time: "03:14:39", bib: "A16045" },
  { date: "2025.03.02", event: "重庆马拉松", time: "03:00:33", bib: "B08049" },
  { date: "2025.03.23", event: "武汉马拉松", time: "03:13:54", bib: "A01701" },
  { date: "2025.05.25", event: "长春马拉松", time: "03:44:57", tag: "🐰", bib: "B07232" },
  { date: "2025.08.31", event: "哈尔滨马拉松", time: "03:30:17", bib: "A10991" },
  { date: "2025.09.14", event: "沈阳马拉松", time: "03:14:20", bib: "A1418" },
  { date: "2025.10.12", event: "海淀马拉松", time: "03:14:18", bib: "A0819" },
  { date: "2025.10.26", event: "成都马拉松", time: "03:09:54", bib: "A12022" },
  { date: "2025.11.02", event: "北京马拉松", time: "02:59:13", tag: "⏱️", bib: "B1089" },
  { date: "2025.11.16", event: "南京马拉松", time: "03:49:48", bib: "B27692" },
  { date: "2025.11.30", event: "昆明马拉松", time: "03:26:32", bib: "A10340" },
  { date: "2025.12.21", event: "广州马拉松", time: "03:24:21", bib: "A3933" },
  { date: "2025.12.28", event: "海口马拉松", time: "03:26:28", bib: "B20917" },
  { date: "2026.01.11", event: "厦门马拉松", time: "03:29:33", bib: "B04013" },
  { date: "2026.03.22", event: "无锡马拉松", time: "03:09:19", bib: "A17692" },
  { date: "2026.03.29", event: "石家庄马拉松", time: "03:24:16", bib: "B00211" },
  { date: "2026.05.17", event: "银川马拉松", time: "03:19:09", bib: "A00609" },
  { date: "2026.09.19", event: "呼和浩特马拉松", time: "03:18:25", bib: "A02798" },
];

// 半程马拉松（只收城市赛事，公园赛不放）。陈列馆“完赛档案”切到半马时显示。
// 字段同上：date / event / time（净成绩）/ bib；路线来自 data/routes.json（见 MAINTENANCE.md）。
export const halfMarathons = [
  { date: "2024.04.14", event: "北京半程马拉松", time: "01:32:04", bib: "A2261" },
  { date: "2024.08.04", event: "六盘水马拉松", time: "01:47:11", bib: "B20278" },
  { date: "2025.03.09", event: "南京浦口马拉松", time: "02:26:33", bib: "A01507" },
  { date: "2025.03.30", event: "扬州鉴真半程马拉松", time: "01:27:55", bib: "A1903" },
  { date: "2025.04.20", event: "北京半程马拉松", time: "01:28:34", bib: "B0445" },
  { date: "2025.09.21", event: "拉萨半程马拉松", time: "01:59:55", bib: "A0111" },
  { date: "2026.03.15", event: "眉山仁寿半程马拉松", time: "01:33:22", bib: "A8553" },
];

// 越野跑（trail.html）。字段：date / event / group（组别）/ distanceKm（实际距离，证书或 Garmin）/ elevationM（累计爬升）/
// time（官方成绩）/ rank { overall, gender, age }（证书上有什么填什么）/ team（团队赛）/ index（"UTMB" 或 "ITRA"：
// 这场比赛产生了头部的 UTMB / ITRA 表现分）/ itraScore（这一场的 ITRA 单场积分，ITRA 个人页登录后可见，填了卡片上就显示）。
// 路线同样来自 data/routes.json，按 date + event 匹配。没有证书的比赛（赤城）成绩和排名取自 ITRA 公开记录。
// ITRA 个人页：https://itra.run/RunnerSpace/zhi.shi.5256619
export const trailRaces = [
  { date: "2023.10.21", event: "香山国际登山节", group: "20KM 精英组", distanceKm: 20, time: "04:20:32" },
  { date: "2023.12.03", event: "北京三峰连穿越野赛（冬）", group: "22KM", distanceKm: 22.96, elevationM: 1856, time: "06:20:42", rank: { gender: 81 } },
  { date: "2024.03.31", event: "温岭黄金海岸跑山赛", group: "38KM", distanceKm: 36, elevationM: 1955, time: "07:39:04", rank: { overall: 515, gender: 382 } },
  { date: "2024.07.13", event: "崇礼168超级越野赛 TTC", group: "共舞50 · 五人组", distanceKm: 51.2, elevationM: 2497, time: "09:25:19", rank: { gender: 329 }, team: true },
  { date: "2025.05.18", event: "大境门古长城越野赛 by UTMB", group: "20K", distanceKm: 33.1, elevationM: 1348, time: "03:46:39", rank: { overall: 73, gender: 68, age: 20 }, index: "UTMB" },
  { date: "2025.06.14", event: "赤城168超级越野赛", group: "30KM", distanceKm: 29.31, elevationM: 973, time: "03:29:16", rank: { gender: 17 } },
  { date: "2025.07.13", event: "崇礼168超级越野赛 云顶30", group: "云顶30", distanceKm: 26.5, elevationM: 1084, time: "03:12:53", rank: { overall: 51, gender: 45, age: 21 }, index: "ITRA" },
  { date: "2025.11.09", event: "大武夷超级山径赛", group: "虎啸九曲 20KM", distanceKm: 19.31, elevationM: 625, time: "02:33:52", rank: { overall: 50, gender: 41 } },
  { date: "2026.04.12", event: "莫干山越野赛 by UTMB", group: "20K", distanceKm: 25, elevationM: 1208, time: "03:56:13", rank: { overall: 461, gender: 371, age: 95 } },
];

// 已报名、还没跑的赛事，按日期先后排列。
// 第一项是“下一站”，会显示在地图顶部的卡片里；省会赛事还会在地图上以空心点 + 日期标出，
// 非省会城市（例如香港）只出现在卡片里。跑完省会赛事后把它移到 completedMarathons 即可。
export const plannedMarathons = [
  { city: "西安", date: "2026.10.18" },
  { city: "济南", date: "2026.10.25" },
  { city: "杭州", date: "2026.11.01" },
  { city: "长沙", date: "2026.11.15" },
  { city: "上海", date: "2026.12.05" },
  { city: "香港", date: "2027.01.17" },
];
