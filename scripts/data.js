export const CHINA_GEOJSON_URL =
  "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

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
  石家庄: { date: "2026.3.29", time: "03:24:57" },
};

// 可单独维护下一场计划；如果留空，会自动使用下一个未完成省会并显示“待定”。
export const nextMarathonPlan = {
  city: "宁夏回族自治区 · 银川市",
  date: "2026.05.17",
};
