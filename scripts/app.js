import {
  CHINA_GEOJSON_URL,
  chinaMajorRaces,
  capitals,
  completedMarathons,
  hyroxDivisions,
  hyroxRaces,
  triathlonRaces,
  hoodToCoastRaces,
  marathonResults,
  plannedMarathons,
  runnerProfile,
} from "./data.js";

const SUB_THREE_SECONDS = 3 * 60 * 60;

const marathonData = capitals.map((item) => {
  const result = completedMarathons[item.city];
  const half = Boolean(result && result.distance === "half");
  return {
    ...item,
    completed: Boolean(result),
    date: result ? result.date : "",
    time: result ? result.time : "",
    half,
    raceName: item.city + (half ? "半程马拉松" : "马拉松"),
    tag: result && result.tag ? result.tag : "",
    subThree: Boolean(result) && !half && toSeconds(result.time) < SUB_THREE_SECONDS,
  };
});

const capitalByCity = new Map(capitals.map((item) => [item.city, item]));

// 地图标签：引线从省会点出发，折到 [dx, dy]（相对点的像素偏移），再接一条水平横线；
// side 决定横线往左还是往右延伸，赛事名在横线上方，日期·成绩在横线下方。
// 新省会完赛后如果和邻居撞了，在这里调它的折点（标签布局按 1280px 宽的桌面视口调的）。
const mapLabelPlacement = {
  北京: ["right", [18, 0]],
  天津: ["right", [12, 24]],
  石家庄: ["right", [0, -76]],
  太原: ["left", [-18, -42]],
  济南: ["right", [12, 54]],
  郑州: ["right", [14, 24]],
  南京: ["left", [-18, -4]],
  上海: ["right", [56, -12]],
  杭州: ["right", [42, 14]],
  合肥: ["right", [14, 24]],
  武汉: ["right", [0, 32]],
  长沙: ["left", [-28, 42]],
  南昌: ["right", [14, 16]],
  福州: ["right", [18, 2]],
  广州: ["right", [44, 12]],
  海口: ["right", [12, 26]],
  南宁: ["left", [-24, 16]],
  重庆: ["left", [-26, 30]],
  成都: ["left", [-30, -30]],
  贵阳: ["left", [-14, 22]],
  昆明: ["left", [-20, 22]],
  西安: ["right", [12, -16]],
  兰州: ["left", [-18, 6]],
  银川: ["left", [-18, 12]],
  西宁: ["left", [-14, 20]],
  呼和浩特: ["left", [-12, -24]],
  沈阳: ["right", [60, 36]],
  长春: ["right", [48, -14]],
  哈尔滨: ["right", [30, -40]],
  拉萨: ["left", [-10, 28]],
  乌鲁木齐: ["right", [14, -24]],
};

// 赛事名加标记：符号跟在名字后面，例如 "北京马拉松 ⏱️"、"长春马拉松 🐰"。
function decorateRaceName(raceName, tag) {
  return tag ? raceName + " " + tag : raceName;
}

const measureContext = document.createElement("canvas").getContext("2d");

function measureText(text, font) {
  measureContext.font = font;
  return measureContext.measureText(text).width;
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
    nextCity.textContent = next ? (nextCapital ? nextCapital.province + " · " + next.city + "市" : next.city) : "待定";
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

function formatDelta(seconds) {
  return "−" + Math.floor(seconds / 60) + "′" + String(seconds % 60).padStart(2, "0") + "″";
}

// 全马 PB 路径：按时间顺序，每次刷新最好成绩算一级；between 是两级之间跑了几场。
function renderPbPath() {
  const stepper = document.getElementById("pbStepper");
  if (!stepper) {
    return;
  }

  const results = marathonResults.map((item) => ({ ...item, seconds: toSeconds(item.time) }));
  const steps = [];
  let best = Infinity;
  let sinceLast = 0;
  results.forEach((item) => {
    if (item.seconds < best) {
      steps.push({ ...item, delta: best === Infinity ? 0 : best - item.seconds, between: sinceLast });
      best = item.seconds;
      sinceLast = 0;
    } else {
      sinceLast += 1;
    }
  });
  if (steps.length === 0) {
    return;
  }

  const current = steps[steps.length - 1];
  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  };
  setText("pbCurrentValue", current.time.replace(/^0/, ""));
  setText("pbCurrentEvent", current.date.slice(0, 4) + " " + current.event);
  setText("pbTotalValue", formatDelta(steps[0].seconds - current.seconds));
  setText("pbTotalNote", steps.length + " 级 · " + steps[0].date.slice(0, 4) + "–" + current.date.slice(0, 4));
  setText("pbRaceCount", String(results.length));
  setText("pbSubThreeCount", String(results.filter((item) => item.seconds < SUB_THREE_SECONDS).length));
  setText("pbSinceCount", String(sinceLast));

  stepper.innerHTML = steps
    .map((step, index) => {
      const isCurrent = index === steps.length - 1;
      const betweenText = index === 0 ? "" : step.between ? "其间 " + step.between + " 场" : "直接刷新";
      return `
        <div class="pb-step${isCurrent ? " current" : ""}">
          <strong class="pb-step-time">${step.time.replace(/^0/, "")}</strong>
          <span class="pb-step-race">${step.event}<small>${step.date}</small></span>
          <div class="pb-step-rail"><span class="pb-step-node"></span></div>
          <div class="pb-step-meta">
            ${index > 0 ? `<span class="pb-step-delta">${formatDelta(step.delta)}</span>` : ""}
            ${betweenText ? `<span class="pb-step-between">${betweenText}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
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

// ---- 铁人三项（接力）：分段条 + 团队成绩 + 我的那一棒
function renderTriathlon() {
  const grid = document.getElementById("triGrid");
  if (!grid) {
    return;
  }
  const secs = (t) => t.split(":").reduce((a, b) => a * 60 + Number(b), 0);
  const trim = (t) => (t ? t.replace(/^0/, "") : "—");
  const pace = (t, km) => {
    const v = secs(t) / km;
    return Math.floor(v / 60) + ":" + String(Math.round(v % 60)).padStart(2, "0");
  };
  grid.innerHTML = [...triathlonRaces]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => {
      const maxS = Math.max(...r.legs.filter((l) => !l.transition).map((l) => secs(l.time)));
      const legs = r.legs
        .map((l) => '<div class="tri-leg' + (l.mine ? " mine" : "") + (l.transition ? " t" : "") + '"><span>' + l.name + '</span><i style="width:' + Math.max(6, (secs(l.time) / maxS) * 100) + '%"></i>' + (l.transition ? "" : "<em>" + trim(l.time) + "</em>") + "</div>")
        .join("");
      const my = r.legs.find((l) => l.mine);
      return (
        '<article class="tri-ticket"><div class="tri-legs">' + legs + "</div><div class=\"tri-body\">" +
        '<div><div class="tri-title"><b>' + r.place + "</b><span>" + r.date.replaceAll(".", "-") + '</span></div><div class="tri-sub">' + r.event + " · " + r.group + "</div></div>" +
        '<div class="tri-time">' + trim(r.total) + "<small>团队成绩</small></div>" +
        '<div class="tri-stats"><span>我的跑步棒 <b>' + trim(my.time) + "</b></span><span>" + my.distanceKm + " km · <b>" + pace(my.time, my.distanceKm) + "</b>/km</span>" +
        (r.rank && r.rank.group ? "<span>组别排名 <b>" + r.rank.group + "</b></span>" : "") + "</div></div></article>"
      );
    })
    .join("");
}

// ---- 越山向海：全程赛段条（我的段绿色、没跑的灰、中断段划掉）+ 团队成绩 + 我的赛段明细
const hoodToCoastLogo = new URL("../assets/hoodtocoast-logo.webp", import.meta.url).href;

function renderHoodToCoast() {
  const list = document.getElementById("h2cList");
  if (!list) {
    return;
  }
  const secs = (t) => t.split(":").reduce((x, y) => x * 60 + Number(y), 0);
  const trim = (t) => (t ? t.replace(/^0/, "") : "—");
  const fmtS = (v) => (v >= 3600 ? Math.floor(v / 3600) + ":" + String(Math.floor((v % 3600) / 60)).padStart(2, "0") : Math.floor(v / 60)) + ":" + String(Math.round(v % 60)).padStart(2, "0");
  const pace = (v, km) => fmtS(v / km);
  const gradeName = { E: "简单", M: "中等", H: "困难", VH: "极难" };
  const esc = (t) => String(t).replace(/</g, "&lt;");

  list.innerHTML = [...hoodToCoastRaces]
    .sort((x, y) => y.date.localeCompare(x.date))
    .map((r) => {
      const legOf = (to) => r.legs.find((l) => l.to === to);
      const mineBy = Object.fromEntries(r.myLegs.map((m) => [m.to, m]));
      const affected = new Set(r.affected || []);
      const runKm = r.legs.reduce((x, l) => x + l.km, 0);
      // 赛段条：宽度按官方里程；行车段画成细段
      const strip = r.legs
        .map((l, i) => {
          const mine = mineBy[l.to];
          const cls = ["h2c-seg", l.drive ? "drive" : "", mine && !mine.skipped ? "mine" : "", mine && mine.skipped ? "skipped" : "", affected.has(l.to) ? "affected" : ""].filter(Boolean).join(" ");
          const title = (i + 1) + " · " + l.name + (l.drive ? "（行车）" : " · " + l.km + " km") + (l.badge ? " · " + l.badge : "") + (affected.has(l.to) ? " · " + (r.affectedNote || "中断") : "");
          // 用 flex-grow 按里程分配宽度，间隙由 flex 自己吃掉，不会溢出右边框
          return '<i class="' + cls + '" style="' + (l.drive ? "flex:0 0 6px" : "flex:" + l.km + " 1 0") + '" title="' + esc(title) + '"></i>';
        })
        .join("");
      const ran = r.myLegs.filter((m) => !m.skipped);
      const mySec = ran.reduce((x, m) => x + secs(m.time), 0), myKm = ran.reduce((x, m) => x + m.distanceKm, 0);
      const myOfficial = ran.reduce((x, m) => x + legOf(m.to).km, 0), myUp = ran.reduce((x, m) => x + (legOf(m.to).up || 0), 0);
      const nights = ran.filter((m) => m.night).length;
      const dates = r.dateEnd ? r.date.replaceAll(".", "-") + " ~ " + r.dateEnd.slice(5).replaceAll(".", "-") : r.date.replaceAll(".", "-");
      const legRows = r.myLegs
        .map((m) => {
          const l = legOf(m.to), idx = r.legs.indexOf(l) + 1;
          const prev = idx > 1 ? r.legs[idx - 2].name : "起点";
          const book = l.km + " km · ↑" + l.up + " ↓" + l.down + " · " + (gradeName[l.grade] || l.grade) + (m.night ? " · 夜跑" : "");
          const badge = l.badge ? '<em class="h2c-badge">' + l.badge + "</em>" : "";
          const right = m.skipped ? '<span class="nums"><b>未跑</b> · ' + m.skipped + "</span>" : '<span class="nums"><b>' + trim(m.time) + "</b> · " + pace(secs(m.time), m.distanceKm) + "/km</span>";
          return '<div class="h2c-leg' + (m.skipped ? " skipped" : "") + '"><b class="n">' + idx + '</b><span class="name">' + prev.replace(/停车场|旅游度假区|风景区/g, "") + " → " + l.name.replace(/停车场|旅游度假区|风景区/g, "") + badge + "<small>" + book + "</small></span>" + right + "</div>";
        })
        .join("");
      return (
        '<article class="h2c-row">' +
        '<img class="h2c-logo" src="' + hoodToCoastLogo + '" alt="越山向海" loading="lazy" />' +
        '<div class="h2c-head"><div class="h2c-title"><b>' + r.date.slice(0, 4) + "</b><span>" + dates + '</span></div><div class="h2c-sub">' + r.event + " · " + r.team + " · " + r.teamSize + " 人 · " + r.distanceKm + " km</div></div>" +
        '<div class="h2c-time">' + trim(r.verified) + "<small>核实成绩" + (r.verifiedNote ? "（" + r.verifiedNote + "）" : "") + "</small></div>" +
        '<div class="h2c-stats"><span>' + r.liveLabel + " <b>" + trim(r.live) + "</b></span><span>总榜 <b>" + r.rank.overall + "</b> · " + r.rank.groupName + " <b>" + r.rank.group + "</b></span></div>" +
        '<div class="h2c-strip" aria-label="全程赛段">' + strip + "</div>" +
        '<div class="h2c-strip-legend"><span><i class="mine"></i>我跑的</span>' + (r.myLegs.some((m) => m.skipped) ? '<span><i class="skipped"></i>排给我但没跑</span>' : "") + (affected.size ? '<span><i class="affected"></i>' + (r.affectedNote || "中断") + "赛段</span>" : "") + '<span><i class="drive"></i>行车</span></div>' +
        '<div class="h2c-stats h2c-mine"><span>我跑了 <b>' + ran.length + "</b> 段 · <b>" + myOfficial.toFixed(1) + "</b> km（" + Math.round((myOfficial / runKm) * 100) + "%）</span><span>均速 <b>" + pace(mySec, myKm) + "</b>/km</span><span>爬升 <b>" + myUp + "</b> m</span>" + (nights ? "<span>夜跑 <b>" + nights + "</b> 段</span>" : "") + "</div>" +
        '<div class="h2c-legs">' + legRows + "</div></article>"
      );
    })
    .join("");
}

async function initMap() {
  updateProfile();
  updateSummary();
  renderChinaMajorRaces();
  renderHyroxRaces();
  renderTriathlon();
  renderHoodToCoast();
  renderPbPath();

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
  if (!chartDom) {
    // 首页没有地图（地图在 gallery.html 的展厅 III），只跑上面的渲染即可。
    return;
  }
  // 用 canvas：标签里的金色横线是富文本块的背景色，SVG 渲染器不画它。
  const chart = window.echarts.init(chartDom, null, { renderer: "canvas" });
  // 配色来自 dataviz 色板（面板 #f8f2e6 上全配对验证通过）：
  // 已完赛 = 琥珀槽 #eda100，下一站/已报名 = 蓝槽 #2a78d6，破三 = 红槽 #e34948。
  // *_LINE 是同色相的深一档（引线），*_TEXT 是文字档（≥ 4.5:1）。
  const AMBER = "#eda100";
  const AMBER_LINE = "#c98500";
  const AMBER_TEXT = "#7a5000";
  const BLUE = "#2a78d6";
  const BLUE_LINE = "#256abf";
  const BLUE_TEXT = "#1c5cab";
  const RED = "#e34948";
  const RED_TEXT = "#b32f2e";
  const INK = "#223027";
  const NUM_FONT = "Avenir Next Condensed, DIN Alternate, Arial Narrow, sans-serif";
  const BODY_FONT = "Avenir Next, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif";
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
        raceName: item.raceName,
        tag: item.tag,
        subThree: item.subThree,
        ...(item.subThree
          ? {
              symbolSize: 18,
              itemStyle: { color: RED, borderColor: INK, borderWidth: 2.2, shadowBlur: 12, shadowColor: "rgba(227, 73, 72, 0.45)" },
            }
          : {}),
      }));

    const plannedPoints = plannedMarathons
      .filter((plan) => capitalByCity.has(plan.city) && !completedMarathons[plan.city])
      .map((plan) => ({
        name: plan.city,
        value: capitalByCity.get(plan.city).coord,
        date: plan.date,
        isNext: plan === nextPlan,
      }));

    const pendingPoints = marathonData
      .filter((item) => !item.completed && !plannedCities.has(item.city))
      .map((item) => ({ name: item.city, value: item.coord }));

    const completedProvinces = marathonData
      .filter((item) => item.completed)
      .map((item) => ({ name: item.province, itemStyle: { areaColor: "#f6e3b4" } }));

    const buildOption = () => {
      const showLabels = !compact.matches;
      return {
        graphic: { elements: [] },
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
            borderColor: "rgba(67, 81, 68, 0.32)",
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
          borderColor: "rgba(34, 48, 39, 0.18)",
          textStyle: { color: INK },
          formatter: (params) => {
            if (params.seriesName === "completed") {
              return `<b>${decorateRaceName(params.data.raceName, params.data.tag)}</b><br/>${params.data.date} · ${params.data.time}`;
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
              color: AMBER,
              borderColor: INK,
              borderWidth: 1.3,
              shadowBlur: 8,
              shadowColor: "rgba(237, 161, 0, 0.4)",
            },
            label: { show: false },
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
                ? { color: BLUE, borderColor: "#fff", borderWidth: 2, shadowBlur: 12, shadowColor: BLUE }
                : { color: "#fff", borderColor: BLUE, borderWidth: 2 },
              rippleEffect: { scale: point.isNext ? 3.2 : 0 },
            })),
            rippleEffect: { brushType: "stroke", period: 3 },
            label: { show: false },
            z: 4,
          },
        ],
      };
    };

    const labelItems = [
      ...completedPoints.map((point) => ({
        ...point,
        meta: point.date.slice(0, 4) + " · " + point.time,
        lineColor: point.subThree ? RED_TEXT : AMBER_LINE,
        metaColor: point.subThree ? RED_TEXT : AMBER_TEXT,
        nameColor: point.subThree ? RED_TEXT : INK,
      })),
      ...plannedPoints.map((point) => ({
        ...point,
        meta: point.date,
        lineColor: BLUE_LINE,
        metaColor: BLUE_TEXT,
        nameColor: BLUE_TEXT,
      })),
    ];

    // 引线 → 折点 → 横线，赛事名压在横线上，日期·成绩挂在横线下。
    const drawPosterLabels = () => {
      const elements = [];
      if (!compact.matches) {
        labelItems.forEach((item) => {
          const [px, py] = chart.convertToPixel("geo", item.value);
          const [side, [dx, dy]] = mapLabelPlacement[item.name] || ["right", [30, -24]];
          const name = decorateRaceName(item.raceName || item.name + "马拉松", item.tag);
          const emphasis = Boolean(item.subThree);
          const nameFont = (emphasis ? "800 13.5px " : "700 12.5px ") + BODY_FONT;
          const ruleWidth = measureText(name, nameFont) + 6;
          const elbowX = px + dx;
          const elbowY = py + dy;
          const farX = side === "left" ? elbowX - ruleWidth : elbowX + ruleWidth;
          // 文字从折点出发向外排：右侧标签左对齐、左侧标签右对齐，超长的成绩行只会往外溢，不会压回点上。
          // 文字起点离折点至少 6px；如果引线在成绩行的高度上从文字下方穿过，再往外推到离引线 8px。
          const metaRowY = elbowY + 11;
          const leaderCrossesMetaRow = (metaRowY - py) * (metaRowY - elbowY) <= 0 && elbowY !== py;
          const leaderXAtMetaRow = leaderCrossesMetaRow
            ? px + (elbowX - px) * ((metaRowY - py) / (elbowY - py))
            : null;
          let textX = side === "left" ? elbowX - 6 : elbowX + 6;
          if (leaderXAtMetaRow !== null) {
            textX = side === "left" ? Math.min(textX, leaderXAtMetaRow - 8) : Math.max(textX, leaderXAtMetaRow + 8);
          }
          const textAlign = side === "left" ? "right" : "left";

          elements.push({
            type: "polyline",
            silent: true,
            z: 10,
            shape: { points: [[px, py], [elbowX, elbowY], [farX, elbowY]] },
            style: { stroke: item.lineColor, lineWidth: emphasis ? 1.8 : 1.2, fill: "none" },
          });
          elements.push({
            type: "text",
            silent: true,
            z: 11,
            x: textX,
            y: elbowY - 3,
            style: {
              text: name,
              fill: item.nameColor,
              font: (emphasis ? "800 13.5px " : "700 12.5px ") + BODY_FONT,
              textAlign,
              textVerticalAlign: "bottom",
            },
          });
          elements.push({
            type: "text",
            silent: true,
            z: 11,
            x: textX,
            y: elbowY + 4,
            style: {
              text: item.meta,
              fill: item.metaColor,
              font: (emphasis ? "700 12.5px " : "600 12px ") + NUM_FONT,
              textAlign,
              textVerticalAlign: "top",
            },
          });
        });
      }
      chart.setOption({ graphic: { elements } }, { replaceMerge: ["graphic"] });
    };

    chart.setOption(buildOption());
    drawPosterLabels();

    window.addEventListener("resize", () => {
      chart.resize();
      drawPosterLabels();
    });
    compact.addEventListener("change", () => {
      chart.setOption(buildOption(), true);
      drawPosterLabels();
    });
  } catch (error) {
    console.error(error);
    chart.dispose();
    showMapError("中国地图数据未能加载：" + (error && error.message ? error.message : "未知错误"));
  }
}

initMap();
