import {
  CHINA_GEOJSON_URL,
  chinaMajorRaces,
  capitals,
  completedMarathons,
  hyroxDivisions,
  hyroxRaces,
  plannedMarathons,
  runnerProfile,
} from "./data.js";

const marathonData = capitals.map((item) => {
  const result = completedMarathons[item.city];
  return {
    ...item,
    completed: Boolean(result),
    date: result ? result.date : "",
    time: result ? result.time : "",
  };
});

const capitalByCity = new Map(capitals.map((item) => [item.city, item]));

// 地图标签的方向和像素偏移，按城市手动指定，把拥挤区的标签用引线拉到空白处。
const mapLabelPlacement = {
  北京: ["top", [24, -36]],
  天津: ["right", [54, 26]],
  石家庄: ["bottom", [-6, 36]],
  太原: ["top", [-6, -30]],
  济南: ["right", [60, 18]],
  郑州: ["bottom", [0, 10]],
  南京: ["right", [48, -34]],
  上海: ["right", [58, -12]],
  杭州: ["right", [58, 40]],
  合肥: ["bottom", [0, 10]],
  武汉: ["bottom", [16, 22]],
  长沙: ["left", [-44, 26]],
  南昌: ["right", [10, 6]],
  福州: ["right", [40, 14]],
  广州: ["right", [44, 12]],
  海口: ["bottom", [0, 14]],
  南宁: ["left", [-30, 8]],
  重庆: ["left", [-40, 10]],
  成都: ["left", [-36, -10]],
  贵阳: ["bottom", [0, 10]],
  昆明: ["left", [-30, 14]],
  西安: ["bottom", [-12, 30]],
  兰州: ["top", [-20, -30]],
  银川: ["top", [-40, -30]],
  西宁: ["left", [-10, 10]],
  呼和浩特: ["top", [-34, -28]],
  沈阳: ["right", [44, 12]],
  长春: ["right", [44, -16]],
  哈尔滨: ["top", [26, -16]],
  拉萨: ["bottom", [0, 14]],
  乌鲁木齐: ["top", [0, -20]],
};

function mapLabelFor(city, { nameColor, lineColor, metaColor, numFont }) {
  const [position, offset] = mapLabelPlacement[city] || ["right", [10, 0]];
  const name = city + "马拉松";
  return {
    position,
    offset,
    align: "left",
    rich: {
      n: { color: nameColor, fontSize: 12.5, fontWeight: 700, lineHeight: 15 },
      l: { width: name.length * 12.5 + 2, height: 1.5, lineHeight: 6, backgroundColor: lineColor },
      t: { color: metaColor, fontSize: 12, fontWeight: 600, lineHeight: 15, fontFamily: numFont },
    },
  };
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function setPersonalBest(prefix, personalBest) {
  const valueElement = document.getElementById(prefix + "Value");
  const eventElement = document.getElementById(prefix + "Event");
  const dateElement = document.getElementById(prefix + "Date");
  if (!valueElement || !eventElement || !dateElement) {
    return;
  }

  const normalizedPersonalBest =
    typeof personalBest === "object" && personalBest !== null
      ? personalBest
      : { time: personalBest, event: "", date: "" };
  const time = normalizeText(normalizedPersonalBest.time);
  const race = normalizeText(normalizedPersonalBest.event);
  const date = normalizeText(normalizedPersonalBest.date);

  valueElement.textContent = time || "待填写";
  valueElement.classList.toggle("pending", !time);

  eventElement.textContent = race || "待填写";
  eventElement.classList.toggle("pending", !race);

  dateElement.textContent = date || " ";
  dateElement.classList.toggle("pending", !date);
}

function setPerformanceMetric(prefix, metric) {
  const valueElement = document.getElementById(prefix + "Value");
  const eventElement = document.getElementById(prefix + "Event");
  const dateElement = document.getElementById(prefix + "Date");
  if (!valueElement || !eventElement || !dateElement) {
    return;
  }

  const normalizedMetric =
    typeof metric === "object" && metric !== null ? metric : { score: metric, event: "", date: "" };
  const score = normalizeText(normalizedMetric.score);
  const event = normalizeText(normalizedMetric.event);
  const date = normalizeText(normalizedMetric.date);

  valueElement.textContent = score || "待填写";
  valueElement.classList.toggle("pending", !score);

  eventElement.textContent = event || "待填写";
  eventElement.classList.toggle("pending", !event);

  dateElement.textContent = date || " ";
  dateElement.classList.toggle("pending", !date);
}

function updateProfile() {
  setPersonalBest("fullMarathonPb", runnerProfile.fullMarathonPb);
  setPersonalBest("halfMarathonPb", runnerProfile.halfMarathonPb);
  setPerformanceMetric("itraPerformance", runnerProfile.itraPerformance);
  setPerformanceMetric("utmbPerformance", runnerProfile.utmbPerformance);
}

function updateSummary() {
  const total = marathonData.length;
  const completed = marathonData.filter((item) => item.completed).length;
  const next = plannedMarathons[0];
  const nextCapital = next ? capitalByCity.get(next.city) : null;
  const doneValue = document.getElementById("mapDoneValue");
  const nextCity = document.getElementById("mapNextCity");
  const nextDate = document.getElementById("mapNextDate");

  if (doneValue) {
    doneValue.textContent = completed + " / " + total;
  }
  if (nextCity) {
    nextCity.textContent = nextCapital ? nextCapital.province + " · " + next.city + "市" : "待定";
  }
  if (nextDate) {
    nextDate.textContent = next ? "比赛日期 · " + next.date : "待填写";
  }
}

function renderChinaMajorRaces() {
  const majorRaceGrid = document.getElementById("majorRaceGrid");
  if (!majorRaceGrid) {
    return;
  }

  majorRaceGrid.innerHTML = chinaMajorRaces
    .map((race) => {
      const result = completedMarathons[race.city];
      const time = result && result.time ? result.time : "待填写";
      const date = result && result.date ? result.date : "待填写";
      const timeClass = !result || !result.time ? " pending" : "";
      const medalMarkup = race.medalImage
        ? `
          <figure class="major-race-medal-frame">
            <img
              class="major-race-medal"
              src="${race.medalImage}"
              alt="${race.year} ${race.event} 奖牌"
              loading="lazy"
            />
          </figure>
        `
        : "";

      return `
        <article
          class="major-race-card"
          style="--race-accent:${race.accent};--race-soft:${race.soft};"
        >
          <div class="major-race-head">
            <span class="major-race-year">${race.year}</span>
            <span class="major-race-badge">${race.badge}</span>
          </div>
          <div class="major-race-body">
            <div class="major-race-copy">
              <h3 class="major-race-title">${race.event}</h3>
              <div class="major-race-performance">
                <strong class="major-race-time${timeClass}">${time}</strong>
              </div>
            </div>
            ${medalMarkup}
          </div>
          <div class="major-race-footer">
            <span>完赛日期</span>
            <strong>${date}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function toSeconds(text) {
  return String(text)
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

function renderHyroxRaces() {
  const hyroxRaceGrid = document.getElementById("hyroxRaceGrid");
  const hyroxDivisionTrack = document.getElementById("hyroxDivisionTrack");
  if (!hyroxRaceGrid) {
    return;
  }

  if (hyroxDivisionTrack) {
    const finishedDivisions = new Set(hyroxRaces.map((race) => race.division));
    hyroxDivisionTrack.innerHTML = hyroxDivisions
      .map((division, index) => {
        const arrow = index === 0 ? "" : '<i aria-hidden="true">→</i>';
        const doneClass = finishedDivisions.has(division.code) ? " done" : "";
        return `${arrow}<span class="hyrox-division-step${doneClass}">${division.code}${division.label ? " " + division.label : ""}</span>`;
      })
      .join("");
  }

  const renderCell = (className, name, shortName, time, rank) => {
    const rankMarkup = rank
      ? `<span class="hyrox-cell-rank">#${rank}</span>`
      : `<span class="hyrox-cell-rank empty">&nbsp;</span>`;
    return `
      <div class="hyrox-cell ${className}">
        <span class="hyrox-cell-name"><span class="full">${name}</span><span class="short">${shortName}</span></span>
        <strong class="hyrox-cell-time">${time}</strong>
        ${rankMarkup}
      </div>
    `;
  };

  hyroxRaceGrid.innerHTML = hyroxRaces
    .map((race) => {
      const runSeconds = toSeconds(race.splits.run);
      const stationSeconds = toSeconds(race.splits.station);
      const roxzoneSeconds = toSeconds(race.splits.roxzone);
      const runCells = race.runs
        .map((run, index) => renderCell("run", `跑 ${index + 1}`, `跑${index + 1}`, run.time, run.rank))
        .join("");
      const stationCells = race.stations
        .map((station) => {
          const className = race.relay ? (station.mine ? "mine" : "other") : "mine";
          return renderCell(className, station.name, station.short, station.time, station.rank);
        })
        .join("");
      const legend = race.relay
        ? `<span><i class="mine"></i>柿子承担的站</span><span><i class="other"></i>队友承担的站</span><span><i class="run"></i>跑段</span>`
        : `<span><i class="mine"></i>双人组：全部站点共同完成</span><span><i class="run"></i>跑段</span>`;
      const footLead = race.medal
        ? `<span class="hyrox-medal">${race.medal}</span>`
        : `<span>${race.footNote || ""}</span>`;

      return `
        <article class="hyrox-ticket">
          <div class="hyrox-ticket-head">
            <span class="hyrox-division"><b>${race.division}</b> ${race.divisionLabel}</span>
            <span class="hyrox-date">${race.date}</span>
          </div>
          <h3 class="hyrox-title">${race.event}<small>${race.team}</small></h3>
          <div class="hyrox-time-row">
            <strong class="hyrox-time">${race.time}</strong>
            <div class="hyrox-rank">
              <span>总排名 <strong>#${race.overall.rank} <small>/ ${race.overall.total}</small></strong> · ${race.overall.percentile}</span>
              <span>年龄组 <strong>#${race.ageGroup.rank} <small>/ ${race.ageGroup.total}</small></strong></span>
            </div>
          </div>
          <div
            class="hyrox-split"
            style="--run:${runSeconds}fr;--station:${stationSeconds}fr;--roxzone:${roxzoneSeconds}fr;"
            aria-hidden="true"
          ><i></i><i></i><i></i></div>
          <div class="hyrox-split-legend">
            <span><i class="run"></i>跑步 <b>${race.splits.run}</b></span>
            <span><i class="station"></i>站点 <b>${race.splits.station}</b></span>
            <span><i class="roxzone"></i>换项 <b>${race.splits.roxzone}</b></span>
          </div>
          <div class="hyrox-course">
            <div class="hyrox-course-row"><div class="hyrox-course-label">RUN</div>${runCells}</div>
            <div class="hyrox-course-row"><div class="hyrox-course-label">STN</div>${stationCells}</div>
          </div>
          <div class="hyrox-key">${legend}</div>
          <div class="hyrox-foot">${footLead}<span>${race.rankNote || ""}</span></div>
        </article>
      `;
    })
    .join("");
}

function showMapError(message) {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    return;
  }

  mapElement.innerHTML = `
    <div class="map-error">
      <div>
        <strong>地图加载失败</strong>
        <div>${message}</div>
      </div>
    </div>
  `;
}

async function initMap() {
  updateProfile();
  updateSummary();
  renderChinaMajorRaces();
  renderHyroxRaces();

  if (window.location.protocol === "file:") {
    showMapError(
      "当前是通过 file:// 直接打开页面。浏览器通常会拦截模块脚本或本地 GeoJSON 读取，请改用本地静态服务器访问，例如先运行 python3 -m http.server 8000，再打开 http://localhost:8000。"
    );
    return;
  }

  if (!window.echarts) {
    showMapError("ECharts 脚本未成功加载，请检查网络或 CDN 地址。");
    return;
  }

  const chartDom = document.getElementById("map");
  // 用 canvas：标签里的金色横线是富文本块的背景色，SVG 渲染器不画它。
  const chart = window.echarts.init(chartDom, null, { renderer: "canvas" });
  const GOLD = "#b8862b";
  const GOLD_BRIGHT = "#d9a441";
  const GOLD_DEEP = "#8f6516";
  const INK = "#223027";
  const NUM_FONT = "Avenir Next Condensed, DIN Alternate, Arial Narrow, sans-serif";
  const labelStyle = {
    nameColor: INK,
    lineColor: GOLD,
    metaColor: GOLD_DEEP,
    numFont: NUM_FONT,
  };
  const compact = window.matchMedia("(max-width: 780px)");

  try {
    const response = await fetch(CHINA_GEOJSON_URL);
    if (!response.ok) {
      throw new Error("GeoJSON 请求失败，状态码 " + response.status);
    }

    const chinaGeoJSON = await response.json();
    window.echarts.registerMap("china-marathon", chinaGeoJSON);

    const plannedCities = new Set(plannedMarathons.map((item) => item.city));
    const nextPlan = plannedMarathons[0];

    const completedPoints = marathonData
      .filter((item) => item.completed)
      .map((item) => ({
        name: item.city,
        value: item.coord,
        date: item.date,
        time: item.time,
        label: mapLabelFor(item.city, labelStyle),
      }));

    const plannedPoints = plannedMarathons
      .filter((plan) => capitalByCity.has(plan.city) && !completedMarathons[plan.city])
      .map((plan) => ({
        name: plan.city,
        value: capitalByCity.get(plan.city).coord,
        date: plan.date,
        isNext: plan === nextPlan,
        label: mapLabelFor(plan.city, { ...labelStyle, lineColor: GOLD_BRIGHT }),
      }));

    const pendingPoints = marathonData
      .filter((item) => !item.completed && !plannedCities.has(item.city))
      .map((item) => ({ name: item.city, value: item.coord }));

    const completedProvinces = marathonData
      .filter((item) => item.completed)
      .map((item) => ({ name: item.province, itemStyle: { areaColor: "#eadcbd" } }));

    const labelLine = (color, width) => ({
      show: true,
      length2: 14,
      smooth: 0.2,
      lineStyle: { color, width },
    });

    const buildOption = () => {
      const showLabels = !compact.matches;
      return {
        backgroundColor: "transparent",
        animationDuration: 900,
        animationEasing: "cubicOut",
        geo: {
          map: "china-marathon",
          roam: false,
          zoom: showLabels ? 1.62 : 1.2,
          center: [105.2, 34.6],
          itemStyle: {
            areaColor: "#f4eee3",
            borderColor: "rgba(184, 134, 43, 0.55)",
            borderWidth: 0.9,
          },
          emphasis: { disabled: true },
          regions: completedProvinces,
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove|click",
          confine: true,
          backgroundColor: "rgba(255, 250, 243, 0.98)",
          borderColor: "rgba(184, 134, 43, 0.4)",
          textStyle: { color: INK },
          formatter: (params) => {
            if (params.seriesName === "completed") {
              return `<b>${params.name}马拉松</b><br/>${params.data.date} · ${params.data.time}`;
            }
            if (params.seriesName === "planned") {
              const prefix = params.data.isNext ? "下一站" : "已报名";
              return `<b>${params.name}马拉松</b><br/>${prefix} · ${params.data.date}`;
            }
            return `${params.name} · 待解锁`;
          },
        },
        series: [
          {
            name: "pending",
            type: "scatter",
            coordinateSystem: "geo",
            data: pendingPoints,
            symbolSize: 6,
            itemStyle: { color: "rgba(34, 48, 39, 0.22)" },
            label: { show: false },
            z: 2,
          },
          {
            name: "completed",
            type: "scatter",
            coordinateSystem: "geo",
            data: completedPoints,
            symbolSize: 12,
            itemStyle: {
              color: GOLD_BRIGHT,
              borderColor: "#fff",
              borderWidth: 1.5,
              shadowBlur: 8,
              shadowColor: "rgba(184, 134, 43, 0.45)",
            },
            label: {
              show: showLabels,
              distance: 10,
              formatter: (params) =>
                `{n|${params.name}马拉松}\n{l| }\n{t|${params.data.date.slice(0, 4)} · ${params.data.time}}`,
            },
            labelLine: labelLine("rgba(184, 134, 43, 0.6)", 1),
            z: 3,
          },
          {
            name: "planned",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: plannedPoints.map((point) => ({
              ...point,
              symbolSize: point.isNext ? 13 : 11,
              itemStyle: point.isNext
                ? { color: INK, borderColor: GOLD_BRIGHT, borderWidth: 2, shadowBlur: 12, shadowColor: GOLD_BRIGHT }
                : { color: "#fff", borderColor: GOLD_BRIGHT, borderWidth: 2 },
              rippleEffect: { scale: point.isNext ? 3.2 : 0 },
            })),
            rippleEffect: { brushType: "stroke", period: 3 },
            label: {
              show: showLabels,
              distance: 10,
              formatter: (params) =>
                `{n|${params.name}马拉松}\n{l| }\n{t|${params.data.isNext ? "NEXT · " : ""}${params.data.date}}`,
            },
            labelLine: labelLine(GOLD_BRIGHT, 1.2),
            z: 4,
          },
        ],
      };
    };

    chart.setOption(buildOption());

    window.addEventListener("resize", () => chart.resize());
    compact.addEventListener("change", () => chart.setOption(buildOption(), true));
  } catch (error) {
    console.error(error);
    chart.dispose();
    showMapError("中国地图数据未能加载：" + (error && error.message ? error.message : "未知错误"));
  }
}

initMap();
