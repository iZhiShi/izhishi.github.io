import { triathlonRaces } from "./data.js";

const secs = t => t.split(":").reduce((a, b) => a * 60 + +b, 0);
const fmtT = t => t ? t.replace(/^0/, "") : "—";
const pace = (t, km) => { const s = secs(t) / km; return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`; };

const items = [...triathlonRaces].sort((a, b) => b.date.localeCompare(a.date));
const mine = items.flatMap(r => r.legs.filter(l => l.mine));
document.getElementById("inventory").innerHTML =
  `<div><b>${items.length}</b><span>场次</span></div><div><b>${mine.reduce((s, l) => s + l.distanceKm, 0).toFixed(1)}<small style="font-size:.9rem;color:var(--ink-soft)"> km</small></b><span>我跑的里程</span></div>` +
  `<div><b>${fmtT(items[0].total)}</b><span>最好团队成绩</span></div><div><b>${Math.min(...items.map(r => r.rank?.group || 999))}</b><span>最好组别名次</span></div>`;

function card(r) {
  const maxS = Math.max(...r.legs.filter(l => !l.transition).map(l => secs(l.time)));
  const legs = r.legs.map(l => `<div class="leg${l.mine ? " mine" : ""}${l.transition ? " t" : ""}"><span>${l.name}</span><i style="width:${Math.max(6, secs(l.time) / maxS * 100)}%"></i></div>`).join("");
  const my = r.legs.find(l => l.mine);
  return `<article class="rec wide">
    <div class="rec-route"><div class="legs">${legs}</div></div>
    <div class="rec-body">
      <div><div class="rec-city"><b class="serif">${r.place}</b><span>${r.date.replaceAll(".", "-")}</span></div><div class="rec-event">${r.event} · ${r.group}</div></div>
      <div class="rec-time cond">${fmtT(r.total)}<small>团队成绩</small></div>
      <div class="rec-stats"><span>我的跑步棒 <b>${fmtT(my.time)}</b></span><span>${my.distanceKm} km · <b>${pace(my.time, my.distanceKm)}</b>/km</span></div>
      <div class="rec-meta"><span class="rec-rank">${r.rank?.group ? `组别排名 ${r.rank.group}` : ""}${r.bib ? ` · ${r.bib}` : ""}</span></div>
    </div></article>`;
}
document.getElementById("records").innerHTML = items.map(card).join("");
