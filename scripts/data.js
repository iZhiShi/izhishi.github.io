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
export const completedMarathons = {
  兰州: { date: "2024.05.26", time: "03:58:06" },
  太原: { date: "2024.09.22", time: "03:18:17" },
  天津: { date: "2024.10.20", time: "03:04:53" },
  福州: { date: "2024.12.15", time: "03:14:39" },
  重庆: { date: "2025.03.02", time: "03:00:33" },
  武汉: { date: "2025.03.23", time: "03:13:54" },
  长春: { date: "2025.05.25", time: "03:44:57" },
  哈尔滨: { date: "2025.08.31", time: "03:30:17" },
  沈阳: { date: "2025.09.14", time: "03:14:20" },
  拉萨: { date: "2025.09.21", time: "01:59:55" },
  成都: { date: "2025.10.26", time: "03:09:54" },
  北京: { date: "2025.11.07", time: "02:59:13" },
  南京: { date: "2025.11.16", time: "03:49:48" },
  昆明: { date: "2025.11.30", time: "03:26:32" },
  广州: { date: "2025.12.21", time: "03:24:21" },
  海口: { date: "2025.12.28", time: "03:26:28" },
  石家庄: { date: "2026.03.29", time: "03:24:57" },
  银川: { date: "2026.05.17", time: "03:19:09" },
  呼和浩特: { date: "2026.09.19", time: "03:18:25" },
};

// 头部成绩卡的数据；各项可填写成绩/分数和赛事，留空会显示“待填写”。
export const runnerProfile = {
  fullMarathonPb: {
    time: "02:59:13",
    event: "2025 北京马拉松",
    date: "2025.11.07",
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

// 可单独维护下一场计划；如果留空，会自动使用下一个未完成省会并显示“待定”。
export const nextMarathonPlan = {
  city: "河南省 · 郑州市",
  date: "2026.10.18",
};
