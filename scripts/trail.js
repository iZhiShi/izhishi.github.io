import { trailRaces, runnerProfile } from "./data.js";

const routes = await (await fetch("data/routes.json")).json();
const routeOf = (date, event) => routes.find(r => r.date === date.replaceAll(".", "-") && r.event === event)?.points || null;
const fmtT = t => t ? t.replace(/^0/, "") : "—";
const placeOf = ev => ({ 香山国际登山节:"北京", "北京三峰连穿越野赛（冬）":"北京", 温岭黄金海岸跑山赛:"温岭", "崇礼168超级越野赛 TTC":"崇礼", "大境门古长城越野赛 by UTMB":"张家口", 赤城168超级越野赛:"赤城", "崇礼168超级越野赛 云顶30":"崇礼", 大武夷超级山径赛:"武夷山", "莫干山越野赛 by UTMB":"莫干山" })[ev] || ev;

const items = trailRaces.map(r => ({ ...r, year: r.date.slice(0, 4), route: routeOf(r.date, r.event) })).sort((a, b) => b.date.localeCompare(a.date));

// ---- inventory
const totalKm = items.reduce((s, r) => s + (r.distanceKm || 0), 0);
const totalUp = items.reduce((s, r) => s + (r.elevationM || 0), 0);
document.getElementById("inventory").innerHTML =
  `<div><b>${items.length}</b><span>场次</span></div><div><b>${Math.round(totalKm)}<small style="font-size:.9rem;color:var(--ink-soft)"> km</small></b><span>累计距离</span></div>` +
  `<div><b>${(totalUp / 1000).toFixed(1)}<small style="font-size:.9rem;color:var(--ink-soft)"> km</small></b><span>累计爬升</span></div>` +
  `<div><b>${runnerProfile.itraPerformance.score}<small style="font-size:.9rem;color:var(--ink-soft)"> / ${runnerProfile.utmbPerformance.score}</small></b><span>ITRA / UTMB</span></div>`;

// ---- cards
let curYear = "all";
const yearsEl = document.getElementById("years"), gridEl = document.getElementById("records");
function renderYears() { const ys = [...new Set(items.map(i => i.year))].sort().reverse();
  yearsEl.innerHTML = [["all", "全部年份"], ...ys.map(y => [y, y])].map(([v, l]) => `<button class="${curYear === v ? "on" : ""}" data-y="${v}">${l}</button>`).join("");
  yearsEl.querySelectorAll("button").forEach(b => b.onclick = () => { curYear = b.dataset.y; renderYears(); renderCards(); }); }
function rankText(r) { if (!r) return ""; const parts = []; if (r.overall) parts.push(`总排名 ${r.overall}${r.total ? ` / ${r.total}` : ""}`); if (r.gender) parts.push(`性别 ${r.gender}`); if (r.age) parts.push(`年龄组 ${r.age}`); return parts.join(" · "); }
function card(it) {
  const tags = [];
  if (it.team) tags.push(`<span class="rec-tag plain">团队赛</span>`);
  const pts = it.route ? it.route.split(" ") : null;
  const start = pts ? pts[0].split(",") : null, end = pts ? pts[pts.length - 1].split(",") : null;
  return `<article class="rec">
    <div class="rec-route">${pts ? `<svg viewBox="-4 -4 108 108"><polyline points="${it.route}"/><circle cx="${start[0]}" cy="${start[1]}" r="2.8"/><circle cx="${end[0]}" cy="${end[1]}" r="2.8" style="fill:#58d995"/></svg>` : `<span class="na">路线待补</span>`}</div>
    <div class="rec-body">
      <div><div class="rec-city"><b class="serif">${placeOf(it.event)}</b><span>${it.date.replaceAll(".", "-")}</span></div><div class="rec-event">${it.event} · ${it.group}</div></div>
      <div class="rec-time cond">${fmtT(it.time)}</div>
      <div class="rec-stats"><span><b>${it.distanceKm}</b> km</span>${it.elevationM ? `<span><b>${it.elevationM.toLocaleString()}</b> m↑</span>` : ""}</div>
      <div class="rec-meta"><span class="rec-rank">${rankText(it.rank)}</span><div class="rec-tags">${tags.join("")}</div></div>
    </div></article>`;
}
function renderCards() { gridEl.innerHTML = items.filter(i => curYear === "all" || i.year === curYear).map(card).join(""); }
renderYears(); renderCards();
