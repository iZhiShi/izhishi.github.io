# 省会马拉松页面维护说明

这个站点已经做了基础工程化拆分，便于后续人工维护。

## 文件结构

```text
.
├── index.html            首页：成绩卡、PB 路径、大满贯、HYROX
├── training.html         训练日志（Garmin 数据）
├── gallery.html          马拉松（大满贯墙、完赛档案、省会地图）
├── trail.html            越野跑档案
├── assets/
│   └── 2025*.webp        奖牌图（400px 宽 WebP）
├── data/
│   ├── china.geojson
│   ├── training.json     由 tools/export_training.py 生成，不要手改
│   └── routes.json       每场比赛的路线折线（归一化到 0–100 的点串）
├── tools/
│   └── export_training.py
├── vendor/
│   └── echarts.min.js    ECharts 5.5.1（本地化）
├── styles/
│   ├── main.css          全站通用 + 首页 + 地图
│   ├── training.css
│   └── gallery.css       陈列馆 + 越野页共用（档案卡片样式）
└── scripts/
    ├── data.js           全部可维护数据
    ├── app.js            首页渲染 + 省会地图（gallery.html 也引用它来画地图）
    ├── training.js
    ├── gallery.js
    └── trail.js
```

各文件职责如下：

- `index.html`
  - 只负责页面结构。
  - 一般只在需要调整版块布局、增删模块时修改。
- `styles/main.css`
  - 负责全部页面样式。
  - 颜色、间距、字号、卡片样式、地图容器尺寸都在这里修改。
- `assets/`
  - 大满贯奖牌图，统一为 400px 宽的 WebP。
  - 页面里显示宽度只有 112px，不需要更大的原图。
  - 新增奖牌见下面的「5. 新增大满贯赛事和奖牌」。
- `data/china.geojson`
  - 本地保存的中国地图 GeoJSON 数据。
  - 页面部署到 GitHub Pages 后，地图直接读取本站文件，不再依赖第三方地图接口。
- `vendor/echarts.min.js`
  - 本地保存的 ECharts 5.5.1，和 GeoJSON 一样不依赖第三方 CDN。
  - 升级时直接替换这个文件，并同步更新 `index.html` 里的版本号注释。
- `scripts/data.js`
  - 负责可维护数据。
  - 包含省会列表、四项个人成绩、省会完赛记录、全部全马成绩、大满贯赛事、HYROX 赛事、报名计划。
  - 日常更新成绩时，通常只需要改这个文件。
- `scripts/app.js`
  - 负责交互和地图逻辑。
  - 包含头部四项成绩渲染、赛事展示、进度计算、tooltip 渲染、ECharts 地图初始化等逻辑。
  - 同时被 `index.html` 和 `gallery.html` 引用；页面上没有的元素会自动跳过（首页没有 `#map`）。
- `training.html` / `styles/training.css` / `scripts/training.js`
  - 训练日志页：今日状态、训练日历（全部历史，按月下拉）、周跑量、训练负荷、90 天恢复趋势。
  - 只读 `data/training.json`，不含手填数据；更新方式见「10. 更新训练日志数据」。
- `trail.html` / `scripts/trail.js`
  - 越野跑档案：`trailRaces`（data.js）+ `data/routes.json`，样式复用 `styles/gallery.css` 的档案卡片。
- `gallery.html` / `styles/gallery.css` / `scripts/gallery.js`
  - 马拉松页：大满贯墙（复用 `chinaMajorRaces`）、完赛档案（`marathonResults` + `halfMarathons` + `data/routes.json`）、省会地图（复用 `app.js`）。

## 最常见维护场景

### 1. 更新已完成的马拉松成绩

编辑 `scripts/data.js` 中的 `completedMarathons`：

```js
export const completedMarathons = {
  北京: { date: "2025.11.07", time: "02:59:13" },
  南京: { date: "2025.11.16", time: "03:49:48" },
};
```

说明：

- 键名使用省会城市名，例如 `北京`、`南京`、`武汉`
- `date` 为完赛日期
- `time` 为完赛时间
- 想给赛事挂个标记就加 `tag`，用一个符号跟在赛事名后面：`tag: "⏱️"`（PB）→“北京马拉松 ⏱️”，`tag: "🐰"`（官方配速员）→“长春马拉松 🐰”
- 半程赛事加 `distance: "half"`，地图标签会写成“xx半程马拉松”，不参与破三判断
- 全马 `time` 快于 3:00:00 的省会会自动标成“破三”：更大的红点、红色文字
- 填入后，对应省份会自动点亮

### 2. 更新全部全马成绩（PB 路径）

编辑 `scripts/data.js` 中的 `marathonResults`，按日期追加：

```js
export const marathonResults = [
  { date: "2026.09.19", event: "呼和浩特马拉松", time: "03:18:25" },
  { date: "2026.10.18", event: "西安马拉松", time: "02:55:00", tag: "⏱️" },
];
```

说明：

- 这是全部全马（含泰安、无锡、海淀、厦门这类非省会赛事），净计时
- 页面顶部的「全马 PB 路径」从这里算：按日期顺序，每次刷新最好成绩就是一级台阶，台阶之间的“其间 N 场”也从这里数
- 省会赛事要在这里和 `completedMarathons` 各记一次（地图只读后者）
- 半程不要放进来

### 3. 更新头部成绩

编辑 `scripts/data.js` 中的 `runnerProfile`：

```js
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
    score: "548",
    event: "ITRA 综合指数 · Intermediate 1",
    date: "2026.10.03",
  },
  utmbPerformance: {
    score: "503",
    event: "UTMB Index · General",
    date: "2026.10.03",
  },
};
```

说明：

- `fullMarathonPb` 显示在头部四项成绩区域中
- `halfMarathonPb` 显示在同一区域中
- PB 需要同时维护 `time`、`event` 和 `date`，分别显示成绩、赛事名和完赛日期
- `itraPerformance` 和 `utmbPerformance` 用 `score` 代替 `time`，显示的是当前综合指数（不是单场分），
  隔一阵去 ITRA / UTMB 个人页（链接在 data.js 注释里）抄最新值，`date` 填抄的日期，页面上标「更新日期」
- 如果留空，页面会自动显示“待填写”

### 4. 更新报名计划

编辑 `scripts/data.js` 中的 `plannedMarathons`，按日期先后排列：

```js
export const plannedMarathons = [
  { city: "西安", date: "2026.10.18" },
  { city: "杭州", date: "2026.11.01" },
];
```

说明：

- `city` 用城市名；省会会上地图，非省会（例如香港）只出现在“下一站”卡片里
- 第一项是“下一站”，显示在地图顶部的卡片里，地图上是蓝色脉冲点
- 其余项在地图上是空心蓝圈 + 日期
- 跑完一场后，把它从这里删掉，再加到 `completedMarathons`
- 列表为空时卡片显示“待定”

### 2b. 新增一场比赛时顺手补全（号码布、半马、路线）

- 全马：在 `marathonResults` 里加 `bib: "A12345"`（号码布，陈列馆完赛档案显示；不填就空着）。
- 半马：加到 `halfMarathons`（只收城市赛事，公园赛不放），字段同全马。
- 越野：加到 `trailRaces`，字段见 data.js 里的注释（组别、实际距离、爬升、官方成绩、排名、是否团队赛、是否产生 UTMB/ITRA 分）。
  没有证书的比赛，成绩和排名可以去 ITRA 个人页（https://itra.run/RunnerSpace/zhi.shi.5256619 ，公开）抄；
  每场的 ITRA / UTMB 单场积分都要登录后才看得到（UTMB 个人页 https://utmb.world/en/runner/6373808.zhi.shi ），
  拿到后可填进 `itraScore`，目前卡片上不显示，只存数据。
- 路线：`data/routes.json` 里每条是 `{ date: "YYYY-MM-DD", event, km, activity_id, points }`，
  `points` 是把 Garmin 轨迹归一化到 0–100 方框后的 `"x,y x,y …"` 点串（经度按纬度余弦校正，纵轴向下）。
  生成办法：在 `~/Documents/workspace/garmin-data` 里用 `tmp/fetch_routes.ts`（按 `date` + `event` 匹配 Garmin 活动，
  走 `/activity-service/activity/{id}/details` 拿 polyline），或者手动从 FIT 导出后按同样规则归一化。
  没有路线的比赛卡片会显示「路线待补」，不影响其它内容。

### 5. 新增大满贯赛事和奖牌

奖牌图统一放在 `assets/`，用 400px 宽的 WebP。原始照片不要直接放进仓库——页面里显示宽度只有 112px，1MB 的原图会让手机端加载明显变慢。

先转换图片（需要 `cwebp`，用 `brew install webp` 安装）：

```bash
cwebp -q 82 -resize 400 0 原图.jpg -o assets/2025厦门马拉松.webp
```

再编辑 `scripts/data.js` 中的 `majorRaceMedals` 和 `chinaMajorRaces`：

```js
const majorRaceMedals = {
  厦门: new URL("../assets/2025厦门马拉松.webp", import.meta.url).href,
};

export const chinaMajorRaces = [
  {
    city: "厦门",            // 必须和 completedMarathons 的键名一致
    event: "厦门马拉松",
    year: "2025",
    badge: "海滨赛道",        // 卡片右上角的短标签
    accent: "#2c5b97",       // 主色，用于成绩数字
    soft: "rgba(44, 91, 151, 0.16)",  // 同色半透明，用于卡片背景
    medalImage: majorRaceMedals.厦门,
  },
];
```

说明：

- `city` 用来去 `completedMarathons` 里查完赛时间和日期，两处必须一致，否则卡片会显示“待填写”
- `medalImage` 可以省略，省略后卡片不显示奖牌图
- `accent` 和 `soft` 建议取同一个色相，`soft` 用 0.16 左右的透明度

### 6. 新增 HYROX 赛事

编辑 `scripts/data.js` 中的 `hyroxRaces`，每场一个对象，8 段跑和 8 个站点按比赛顺序排列（跑 1 → 站 1 → 跑 2 → 站 2 …）：

```js
{
  division: "DOUBLES",          // 对应 hyroxDivisions 里的 code，出现过的组别会在进阶轨上标为已完成
  divisionLabel: "Open 男子双人",
  event: "HYROX 上海站",
  date: "2027.03.14",
  team: "柿子 & 搭档 · AG 35–39",
  time: "1:14:52",
  overall: { rank: 120, total: 800, percentile: "前 15%" },
  ageGroup: { rank: 30, total: 200 },
  splits: { run: "33:10", station: "36:20", roxzone: "5:22" },  // 三色条按这三个时间自动分配宽度
  runs: [{ time: "4:02", rank: 90 }, /* …共 8 段，rank 可省略 */],
  stations: [
    { name: "滑雪机", short: "滑雪", time: "4:10", rank: 200 },
    /* …共 8 站，顺序：滑雪机 推雪橇 拉雪橇 波比跳 划船机 农夫行走 沙袋弓步 墙球 */
  ],
  medal: "",                    // 有奖项就写，例如 "🥈 商学院赛中赛 亚军"
  rankNote: "分段排名为全场排名",
}
```

说明：

- `rank` 没有数据就省略，页面只显示用时，不会显示排名
- 接力赛加 `relay: true`，并给柿子承担的站加 `mine: true`；其余站会显示为队友承担
- 接力赛没有 `medal` 时可以用 `footNote` 写一句赛制说明
- `short` 是手机端显示的两字站名，必填
- 新组别（例如 SINGLE）第一次出现时，进阶轨会自动把它标黑

### 7. 修改头部文案

编辑 `index.html`：

- 头部标题在 `hero-card` 内
- 头部四项成绩在 `.runner-stats` 区块中
- 地图标题也在 `index.html` 中

### 8. 修改样式

编辑 `styles/main.css`：

- 头部四项成绩布局：`.runner-stats`
- 个人成绩容器：`.runner-card`
- 地图顶部指标块：`.map-stats`、`.map-stat`
- 地图图例：`.map-legend`
- PB 路径：`.pb-card`、`.pb-step`（手机端在 `@media (max-width: 780px)` 里改成竖排）
- HYROX 卡片：`.hyrox-card`、`.hyrox-ticket`、`.hyrox-cell`
- 地图大卡：`.map-card`
- 地图标签位置：不在 CSS 里，在 `scripts/app.js` 的 `mapLabelPlacement`

### 10. 更新训练日志数据

数据链路：Garmin → Obsidian 插件 `garmin-cn-sync`（启动时同步 + 每 6 小时）→ `~/SynologyDrive/Garmin/*.md` → `tools/export_training.py` → `data/training.json`。

```bash
python3 tools/export_training.py && git add data/training.json && git commit -m "Update training data" && git push
```

- 脚本只读 Daily / Activities 笔记的 frontmatter，不碰 FIT；路径可用环境变量 `GARMIN_VAULT` 覆盖。
- `training_readiness_score` 是晨起值（当天最早一次计算），`training_readiness_latest` 是同步时刻的最新值，由插件写入。
- 日历里跑步 chip 前的 恢复 / 有氧 / 节奏 / 阈值 / VO₂max / 无氧 来自 Garmin 的 `training_effect_label`，是训练效果判定、不是课表结构（硬拉的马拉松也会被判成 VO₂max）；映射表在 `scripts/training.js` 的 `EFFECT`。
- 页面里「不在北京」的判断顺序：`scripts/training.js` 里的 `trips` 手填行程 > 户外活动 GPS 地点 > 比赛日及前一天 = 赛事城市 > 前后两天同一外地的空档日。
  室内课（力量、跑步机）没有定位，出差期间只练室内课的日子要靠 `trips` 补。
- 想自动化就给 Mac 挂个 launchd 定时任务跑上面这行命令；不要把 Garmin 账号放进 GitHub Secrets。

### 9. 修改地图交互逻辑

编辑 `scripts/app.js`：

- `updateProfile()`
  - 更新头部四项成绩和赛事展示
- `updateSummary()`
  - 更新完成率和下一站展示
- `renderChinaMajorRaces()`
  - 渲染大满贯卡片，成绩从 `completedMarathons` 按城市名查出
- `renderHyroxRaces()`
  - 渲染 HYROX 卡片和组别进阶轨，三色条宽度由 `splits` 三个时间换算
- `renderPbPath()`
  - 从 `marathonResults` 算出 PB 台阶，渲染「全马 PB 路径」步进条和顶部两个指标块
- `mapLabelPlacement`
  - 每个省会标签的方向和像素偏移，新省会完赛后如果标签和邻居重叠，在这里调
- `initMap()`
  - 初始化底图（固定比例、不可缩放拖动）、三类散点（已完赛 / 已报名 / 待解锁）和 tooltip；手机端自动隐藏标签，点击省会看详情

## 数据维护注意事项

### 地图数据来源

- 当前地图数据已经改为读取仓库内的 `data/china.geojson`
- 这样做的原因是避免 GitHub Pages 线上环境依赖第三方地图接口
- 如果后续要替换地图数据文件，优先替换这个本地文件，而不是改回外链

### 第三方依赖

页面目前没有任何运行时外链依赖，所有资源都来自本仓库：

- `vendor/echarts.min.js`：ECharts 5.5.1
- `data/china.geojson`：中国地图数据
- `assets/*.webp`：奖牌图

这样做是为了让 GitHub Pages 上的页面不受第三方 CDN 可用性影响，国内访问也更稳定。新增功能时优先沿用这个原则，不要改回外链。

### 省份点亮规则

- 完赛的省会在地图上是琥珀点 + 引线标签（赛事 · 年份 · 成绩），所在省份底色变成淡琥珀；破三的省会用红点重点标注；下一站/已报名用蓝色
- 这三个色相（琥珀 #eda100 / 蓝 #2a78d6 / 红 #e34948）经过色盲模拟和对比度验证，改色前先跑 dataviz 色板验证器
- 例如：
  - `武汉` 完赛后，武汉出现琥珀点，`湖北省` 变淡琥珀
  - 标签位置由 `scripts/app.js` 的 `mapLabelPlacement` 决定，重叠时调那里

### 省会基础列表

省会基础数据在 `scripts/data.js` 的 `capitals` 中维护。

一般不要轻易改动，除非：

- 需要修正某个省会名称
- 需要修正城市坐标
- 需要补充新的映射关系

## 修改后的检查建议

每次修改后，建议重点检查：

- 页面是否能正常打开
- 地图是否正常加载
- 琥珀点数量是否和 `completedMarathons` 条数一致，标签有无重叠
- hover / 点击省会能否显示日期和成绩
- “下一站”卡片和地图上的蓝色脉冲点是否是同一座城市
- 手机端布局是否仍然正常

## 推荐维护顺序

如果只是日常更新进度，推荐按这个顺序操作：

1. 修改 `scripts/data.js`
2. 在项目目录运行 `python3 .claude/devserver.py`
3. 打开 `http://localhost:8000` 检查页面
4. 确认地图点亮和“下一站”显示无误
5. 提交 git commit

注意：

- 不建议直接双击打开 `index.html`
- 直接以 `file://` 方式访问时，浏览器可能会拦截 ES Module 和本地 `GeoJSON` 文件读取，导致页面显示成“没有数据”或地图加载失败
- `.claude/devserver.py` 就是标准库的 `http.server`，只是额外发送 `Cache-Control: no-store`
- 用普通的 `python3 -m http.server 8000` 也能跑，但浏览器会缓存 `scripts/data.js` 这类 ES Module，改完数据刷新页面常常看不到变化，需要手动强制刷新

## 当前工程化拆分原则

当前拆分遵循以下原则：

- 结构、样式、逻辑、数据分离
- 优先让“高频维护内容”集中在 `scripts/data.js`
- 页面仍保持静态站点形式，方便 GitHub Pages 部署
- 不引入额外构建工具，降低维护成本

如果后续页面继续变复杂，再考虑下一步拆分：

- 增加 `scripts/constants.js`
- 增加 `scripts/map.js`
- 增加 `styles/components.css`
- 增加 `README.md` 作为对外展示说明
