# 省会马拉松页面维护说明

这个站点已经做了基础工程化拆分，便于后续人工维护。

## 文件结构

```text
.
├── index.html
├── data/
│   └── china.geojson
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
- `data/china.geojson`
  - 本地保存的中国地图 GeoJSON 数据。
  - 页面部署到 GitHub Pages 后，地图直接读取本站文件，不再依赖第三方地图接口。
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
    event: "北京马拉松",
  },
  halfMarathonPb: {
    time: "01:25:00",
    event: "广州半程马拉松",
  },
  itraPerformance: {
    score: "550",
    event: "",
  },
  utmbPerformance: {
    score: "499",
    event: "",
  },
};
```

说明：

- `fullMarathonPb` 显示在头部四项成绩区域中
- `halfMarathonPb` 显示在同一区域中
- PB 需要同时维护 `time` 和 `event`，分别显示成绩与赛事名
- `itraPerformance` 显示 ITRA 表现分和赛事名
- `utmbPerformance` 显示 UTMB 表现分和赛事名
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

### 4. 修改头部文案

编辑 `index.html`：

- 头部标题在 `hero-card` 内
- 头部四项成绩在 `.runner-stats` 区块中
- 地图标题也在 `index.html` 中

### 5. 修改样式

编辑 `styles/main.css`：

- 头部四项成绩布局：`.runner-stats`
- 个人成绩容器：`.runner-card`
- 完成率卡：`.progress-panel`
- 下一站卡：`.next-stop`
- 地图顶部信息区：`.map-overview`
- 地图大卡：`.map-card`
- tooltip：`.tooltip-*`

### 6. 修改地图交互逻辑

编辑 `scripts/app.js`：

- `updateProfile()`
  - 更新头部四项成绩和赛事展示
- `updateSummary()`
  - 更新完成率和下一站展示
- `buildTooltip()`
  - 控制 hover 到省份上时的展示内容
- `initMap()`
  - 初始化地图、颜色和交互

## 数据维护注意事项

### 地图数据来源

- 当前地图数据已经改为读取仓库内的 `data/china.geojson`
- 这样做的原因是避免 GitHub Pages 线上环境依赖第三方地图接口
- 如果后续要替换地图数据文件，优先替换这个本地文件，而不是改回外链

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
2. 在项目目录运行 `python3 -m http.server 8000`
3. 打开 `http://localhost:8000` 检查页面
4. 确认地图点亮和“下一站”显示无误
5. 提交 git commit

注意：

- 不建议直接双击打开 `index.html`
- 直接以 `file://` 方式访问时，浏览器可能会拦截 ES Module 和本地 `GeoJSON` 文件读取，导致页面显示成“没有数据”或地图加载失败

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
