import {
  CHINA_GEOJSON_URL,
  capitals,
  completedMarathons,
  nextMarathonPlan,
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

function updateSummary() {
  const total = marathonData.length;
  const completed = marathonData.filter((item) => item.completed).length;
  const fallbackNext = marathonData.find((item) => !item.completed);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const nextCity = nextMarathonPlan.city || (fallbackNext ? fallbackNext.city : "已全部完成");
  const nextDate = nextMarathonPlan.date || (fallbackNext ? "待定" : "已点亮全部省会");

  document.getElementById("progressRing").style.setProperty("--progress", percent);
  document.getElementById("progressValue").textContent = completed + " / " + total;
  document.getElementById("nextStopCity").textContent = nextCity;
  document.getElementById("nextStopDate").textContent = "比赛日期 · " + nextDate;
}

function showMapError(message) {
  document.getElementById("map").innerHTML = `
    <div class="map-error">
      <div>
        <strong>地图加载失败</strong>
        <div>${message}</div>
      </div>
    </div>
  `;
}

async function initMap() {
  updateSummary();

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
        borderWidth: 0,
        backgroundColor: "transparent",
        extraCssText: "box-shadow:none;padding:0;",
        formatter: buildTooltip,
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
