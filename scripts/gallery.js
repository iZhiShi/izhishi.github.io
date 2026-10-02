import { marathonResults, halfMarathons, runnerProfile, chinaMajorRaces, capitals } from "./data.js";
const routes = await (await fetch("data/routes.json")).json();
const routeOf = (date, event) => routes.find(r => r.date === date.replaceAll(".", "-") && r.event === event)?.points || null;

const cityOf = ev => ({ 海淀马拉松:"北京", 扬州鉴真半程马拉松:"扬州", 眉山仁寿半程马拉松:"眉山", 南京浦口马拉松:"南京", 六盘水马拉松:"六盘水", 北京半程马拉松:"北京", 拉萨半程马拉松:"拉萨" })[ev] || ev.replace(/(半程)?马拉松$/, "");
const capitalSet = new Set(capitals.map(c => c.city));
const majorSet = new Set(chinaMajorRaces.map(r => `${r.year} ${r.event}`));

const full = marathonResults.map(r => ({ type:"full", year:r.date.slice(0,4), date:r.date, event:r.event, time:r.time, tag:r.tag, bib: r.bib || null, route: routeOf(r.date, r.event) }));
const half = halfMarathons.map(r => ({ type:"half", year:r.date.slice(0,4), date:r.date, event:r.event, time:r.time, bib:r.bib || null, route: routeOf(r.date, r.event) }));
const items = [...full, ...half].sort((a,b) => (b.date || b.year + ".99").localeCompare(a.date || a.year + ".99"));
const subThree = it => it.type === "full" && it.time < "03:00:00";
const fmtT = t => t ? t.replace(/^0/, "") : "—";

// ---- inventory
const capsDone = new Set([...full, ...half].map(f => cityOf(f.event)).filter(c => capitalSet.has(c))); // 与地图口径一致：拉萨半马也算点亮
document.getElementById("inventory").innerHTML = `<div><b>${full.length}</b><span>全马</span></div><div><b>${half.length}</b><span>半马</span></div><div><b>${capsDone.size}<small style="font-size:1rem;color:var(--ink-soft)"> / 31</small></b><span>省会</span></div><div class="pb"><b>${fmtT(runnerProfile.fullMarathonPb.time)}</b><span>全马 PB</span></div>`;

// ---- medal wall
document.getElementById("medals").innerHTML = chinaMajorRaces.map(r => { const it = full.find(f => f.event === r.event && f.year === r.year);
  return `<figure class="medal"><img src="${r.medalImage}" alt="${r.year} ${r.event}奖牌" loading="lazy" /><figcaption class="plaque"><b class="serif">${r.event}</b><span>${it?.date || r.year} · <span class="t${it && subThree(it) ? " sub3" : ""}">${fmtT(it?.time)}</span></span></figcaption></figure>`; }).join("");

// ---- race records
let curType = "full", curYear = "all";
const yearsEl = document.getElementById("years"), gridEl = document.getElementById("records");
function renderYears() { const ys = [...new Set(items.filter(i => curType==="all"||i.type===curType).map(i=>i.year))].sort().reverse();
  if (!ys.includes(curYear)) curYear = "all";
  yearsEl.innerHTML = [["all","全部年份"], ...ys.map(y=>[y,y])].map(([v,l]) => `<button class="${curYear===v?"on":""}" data-y="${v}">${l}</button>`).join("");
  yearsEl.querySelectorAll("button").forEach(b => b.onclick = () => { curYear = b.dataset.y; renderYears(); renderCards(); }); }
function card(it) {
  const city = cityOf(it.event);
  const tags = [];
  if (it.tag === "🐰") tags.push(`<span class="rec-tag">配速员</span>`);
  if (majorSet.has(`${it.year} ${it.event}`)) tags.push(`<span class="rec-tag">大满贯</span>`);
  if (capitalSet.has(city) && it.type === "full") tags.push(`<span class="rec-tag plain">省会</span>`);
  const pts = it.route ? it.route.split(" ") : null;
  const start = pts ? pts[0].split(",") : null, end = pts ? pts[pts.length-1].split(",") : null;
  return `<article class="rec${subThree(it) ? " sub3" : ""}">
    <div class="rec-route">${pts ? `<svg viewBox="-4 -4 108 108"><polyline points="${it.route}"/><circle cx="${start[0]}" cy="${start[1]}" r="2.8"/><circle cx="${end[0]}" cy="${end[1]}" r="2.8" style="fill:#58d995"/></svg>` : `<span class="na">路线待补</span>`}</div>
    <div class="rec-body">
      <div><div class="rec-city"><b class="serif">${city}</b><span>${it.date ? it.date.replaceAll(".", "-") : it.year}</span></div><div class="rec-event">${it.event}${it.type === "half" && !/半程/.test(it.event) ? " · 半程" : ""}</div></div>
      <div class="rec-time cond">${fmtT(it.time)}</div>
      <div class="rec-meta"><span>${it.bib || ""}</span><div class="rec-tags">${tags.join("")}</div></div>
    </div></article>`;
}
function renderCards() { gridEl.innerHTML = items.filter(i => (curType==="all"||i.type===curType) && (curYear==="all"||i.year===curYear)).map(card).join(""); }
document.querySelectorAll("#typeTools button").forEach(b => b.onclick = () => { curType = b.dataset.t; document.querySelectorAll("#typeTools button").forEach(x => x.classList.toggle("on", x===b)); renderYears(); renderCards(); });
renderYears(); renderCards();
