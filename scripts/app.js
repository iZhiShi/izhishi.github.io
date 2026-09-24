import {
  CHINA_GEOJSON_URL,
  chinaMajorRaces,
  capitals,
  completedMarathons,
  hyroxDivisions,
  hyroxRaces,
  nextMarathonPlan,
  runnerProfile,
} from "./data.js";

const marathonDataByProvince = new Map();

const marathonData = capitals.map((item) => {
  const result = completedMarathons[item.city];
  const data = {
    ...item,
    name: item.province,
    value: result ? 1 : 0,
    completed: Boolean(result),
    date: result ? result.date : "",
    time: result ? result.time : "",
    medalColor: result && result.medalColor ? result.medalColor : "#c89a35",
  };

  marathonDataByProvince.set(item.province, data);
  return data;
});

function medalSvg(color = "#c89a35", size = 22) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2h4l1.6 6.2-3.2 1.8L6 2Z" fill="#c85656"></path>
      <path d="M18 2h-4l-1.6 6.2 3.2 1.8L18 2Z" fill="#4f73b6"></path>
      <circle cx="12" cy="15.2" r="5.8" fill="${color}"></circle>
      <path d="m12 11.9 1 2 2.2.3-1.6 1.5.4 2.1-2-1.1-2 1.1.4-2.1-1.6-1.5 2.2-.3 1-2Z" fill="#fff3d1"></path>
    </svg>
  `;
}

function normalizeProvinceName(name) {
  if (!name) {
    return "";
  }

  const directMatch = marathonDataByProvince.get(name);
  if (directMatch) {
    return name;
  }

  return (
    marathonData.find((item) => name.includes(item.province) || item.province.includes(name))
      ?.province || name
  );
}

function getProvinceData(name) {
  return marathonDataByProvince.get(normalizeProvinceName(name));
}

function buildTooltip(params) {
  const data = getProvinceData(params.name);
  if (!data) {
    return "";
  }

  const statusHtml = data.completed
    ? `<span class="tooltip-status done">${medalSvg(data.medalColor, 18)} 已完成</span>`
    : `<span class="tooltip-status pending"><span class="tooltip-status-dot"></span>待解锁</span>`;

  const detailsHtml = data.completed
    ? `
      <div class="tooltip-row"><span>完赛日期</span><strong>${data.date}</strong></div>
      <div class="tooltip-row"><span>完赛时间</span><strong>${data.time}</strong></div>
    `
    : `
      <div class="tooltip-row"><span>当前状态</span><strong>尚未完成</strong></div>
    `;

  return `
    <div class="tooltip-card">
      <div class="tooltip-head">
        <div>
          <strong>${data.province}</strong>
          <div class="tooltip-subtitle">省会城市：${data.city}</div>
        </div>
        ${statusHtml}
      </div>
      ${detailsHtml}
    </div>
  `;
}

function getTooltipPosition(point, _params, _dom, _rect, size) {
  const gap = 12;
  const [boxWidth, boxHeight] = size.contentSize;
  const [viewWidth, viewHeight] = size.viewSize;

  let x = point[0] + gap;
  let y = point[1] - boxHeight - gap;

  if (x + boxWidth > viewWidth - gap) {
    x = viewWidth - boxWidth - gap;
  }
  if (x < gap) {
    x = gap;
  }

  if (y < gap) {
    y = point[1] + gap;
  }
  if (y + boxHeight > viewHeight - gap) {
    y = Math.max(gap, viewHeight - boxHeight - gap);
  }

  return [x, y];
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
  const fallbackNext = marathonData.find((item) => !item.completed);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const nextCity = nextMarathonPlan.city || (fallbackNext ? fallbackNext.city : "已全部完成");
  const nextDate = nextMarathonPlan.date || (fallbackNext ? "待定" : "已点亮全部省会");
  const progressRing = document.getElementById("progressRing");
  const progressValue = document.getElementById("progressValue");
  const nextStopCity = document.getElementById("nextStopCity");
  const nextStopDate = document.getElementById("nextStopDate");

  if (progressRing) {
    progressRing.style.setProperty("--progress", percent);
  }
  if (progressValue) {
    progressValue.textContent = completed + " / " + total;
  }
  if (nextStopCity) {
    nextStopCity.textContent = nextCity;
  }
  if (nextStopDate) {
    nextStopDate.textContent = "比赛日期 · " + nextDate;
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
  const chart = window.echarts.init(chartDom, null, { renderer: "svg" });

  try {
    const response = await fetch(CHINA_GEOJSON_URL);
    if (!response.ok) {
      throw new Error("GeoJSON 请求失败，状态码 " + response.status);
    }

    const chinaGeoJSON = await response.json();
    window.echarts.registerMap("china-marathon", chinaGeoJSON);

    const mapData = marathonData.map((item) => ({
      name: item.province,
      value: item.completed ? 1 : 0,
      city: item.city,
      province: item.province,
      completed: item.completed,
      date: item.date,
      time: item.time,
      medalColor: item.medalColor,
    }));

    chart.setOption({
      backgroundColor: "transparent",
      animationDuration: 900,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "item",
        enterable: true,
        confine: true,
        borderWidth: 0,
        backgroundColor: "transparent",
        extraCssText: "box-shadow:none;padding:0;",
        formatter: buildTooltip,
        position: getTooltipPosition,
      },
      visualMap: {
        show: false,
        min: 0,
        max: 1,
        inRange: {
          color: ["#b7bdb1", "#2f7c53"],
        },
      },
      series: [
        {
          name: "省会马拉松进度",
          type: "map",
          map: "china-marathon",
          roam: true,
          zoom: 1.08,
          scaleLimit: {
            min: 1,
            max: 6,
          },
          data: mapData,
          selectedMode: false,
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: "#b7bdb1",
            borderColor: "#f8f2e8",
            borderWidth: 1.1,
            shadowBlur: 10,
            shadowColor: "rgba(74, 58, 35, 0.08)",
          },
          emphasis: {
            label: {
              show: true,
              formatter: (params) => {
                const data = getProvinceData(params.name);
                return data ? data.city : params.name;
              },
              color: "#173424",
              fontWeight: 700,
              backgroundColor: "rgba(248,252,249,0.92)",
              padding: [4, 8],
              borderRadius: 999,
            },
            itemStyle: {
              areaColor: "#3d9163",
              borderColor: "#fff8eb",
              borderWidth: 1.5,
              shadowBlur: 16,
              shadowColor: "rgba(47, 124, 83, 0.18)",
            },
          },
        },
      ],
    });

    window.addEventListener("resize", () => chart.resize());
  } catch (error) {
    console.error(error);
    chart.dispose();
    showMapError("中国地图数据未能加载：" + (error && error.message ? error.message : "未知错误"));
  }
}

initMap();
