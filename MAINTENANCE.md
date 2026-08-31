# 省会马拉松页面维护说明

这个站点已经做了基础工程化拆分，便于后续人工维护。

## 文件结构

```text
.
├── index.html
├── assets/
│   └── 2025*.webp        奖牌图（400px 宽 WebP）
├── data/
│   └── china.geojson
├── vendor/
│   └── echarts.min.js    ECharts 5.5.1（本地化）
├── styles/
│   └── main.css
└── scripts/
    ├── data.js
    └── app.js
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
  - 新增奖牌见下面的「4. 新增大满贯赛事和奖牌」。
- `data/china.geojson`
  - 本地保存的中国地图 GeoJSON 数据。
  - 页面部署到 GitHub Pages 后，地图直接读取本站文件，不再依赖第三方地图接口。
- `vendor/echarts.min.js`
  - 本地保存的 ECharts 5.5.1，和 GeoJSON 一样不依赖第三方 CDN。
  - 升级时直接替换这个文件，并同步更新 `index.html` 里的版本号注释。
- `scripts/data.js`
  - 负责可维护数据。
  - 包含省会列表、四项个人成绩、已完赛记录、下一站计划。
  - 日常更新成绩时，通常只需要改这个文件。
- `scripts/app.js`
  - 负责交互和地图逻辑。
  - 包含头部四项成绩渲染、赛事展示、进度计算、tooltip 渲染、ECharts 地图初始化等逻辑。

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
- 填入后，对应省份会自动点亮

### 2. 更新头部成绩

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
```

说明：

- `fullMarathonPb` 显示在头部四项成绩区域中
- `halfMarathonPb` 显示在同一区域中
- PB 需要同时维护 `time`、`event` 和 `date`，分别显示成绩、赛事名和完赛日期
- `itraPerformance` 和 `utmbPerformance` 用 `score` 代替 `time`，其余字段相同
- 如果留空，页面会自动显示“待填写”

### 3. 更新下一站计划

编辑 `scripts/data.js` 中的 `nextMarathonPlan`：

```js
export const nextMarathonPlan = {
  city: "宁夏回族自治区 · 银川市",
  date: "2026.05.17",
};
```

说明：

- `city` 显示在地图面板顶部的“下一站”卡片中
- `date` 显示比赛日期
- 如果留空，页面会自动回退到“下一个未完成省会”并显示“待定”

### 4. 新增大满贯赛事和奖牌

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

### 5. 修改头部文案

编辑 `index.html`：

- 头部标题在 `hero-card` 内
- 头部四项成绩在 `.runner-stats` 区块中
- 地图标题也在 `index.html` 中

### 6. 修改样式

编辑 `styles/main.css`：

- 头部四项成绩布局：`.runner-stats`
- 个人成绩容器：`.runner-card`
- 完成率卡：`.progress-panel`
- 下一站卡：`.next-stop`
- 地图顶部信息区：`.map-overview`
- 地图大卡：`.map-card`
- tooltip：`.tooltip-*`

### 7. 修改地图交互逻辑

编辑 `scripts/app.js`：

- `updateProfile()`
  - 更新头部四项成绩和赛事展示
- `updateSummary()`
  - 更新完成率和下一站展示
- `renderChinaMajorRaces()`
  - 渲染大满贯卡片，成绩从 `completedMarathons` 按城市名查出
- `buildTooltip()`
  - 控制 hover 到省份上时的展示内容
- `initMap()`
  - 初始化地图、颜色和交互

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

- 页面是按“省会城市是否完赛”来决定“整个省份是否点亮”
- 例如：
  - `武汉` 完赛后，`湖北省` 变绿
  - `杭州` 完赛后，`浙江省` 变绿

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
- 绿色省份是否和成绩数据一致
- hover 省份时是否能显示日期和成绩
- “下一站”卡片内容是否正确
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
