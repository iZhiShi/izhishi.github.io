import { hoodToCoastRaces } from "./data.js";

const secs = t => t.split(":").reduce((a, b) => a * 60 + +b, 0);
const fmtT = t => t ? t.replace(/^0/, "") : "—";
const fmtS = s => `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ":" : ""}${String(Math.floor(s % 3600 / 60)).padStart(Math.floor(s / 3600) ? 2 : 1, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const pace = (s, km) => { const p = s / km; return `${Math.floor(p / 60)}:${String(Math.round(p % 60)).padStart(2, "0")}`; };

const items = [...hoodToCoastRaces].sort((a, b) => b.date.localeCompare(a.date));
const myKm = items.reduce((s, r) => s + r.myLegs.reduce((a, l) => a + l.distanceKm, 0), 0);
document.getElementById("inventory").innerHTML =
  `<div><b>${items.length}</b><span>届</span></div><div><b>${items.reduce((s, r) => s + r.distanceKm, 0).toFixed(1)}<small style="font-size:.9rem;color:var(--ink-soft)"> km</small></b><span>团队累计</span></div>` +
  `<div><b>${myKm.toFixed(1)}<small style="font-size:.9rem;color:var(--ink-soft)"> km</small></b><span>我跑的里程</span></div><div><b>${Math.min(...items.map(r => r.rank.group))}</b><span>最好组别名次</span></div>`;

function card(r) {
  const maxKm = Math.max(...items.flatMap(x => x.myLegs.map(l => l.distanceKm)));
  const legs = r.myLegs.map((l, i) => `<div class="leg mine"><span>第${i + 1}段</span><i style="width:${l.distanceKm / maxKm * 100}%"></i></div>`).join("");
  const mySec = r.myLegs.reduce((s, l) => s + secs(l.time), 0), myDist = r.myLegs.reduce((s, l) => s + l.distanceKm, 0), myUp = r.myLegs.reduce((s, l) => s + (l.elevationM || 0), 0);
  const dates = r.dateEnd ? `${r.date.replaceAll(".", "-")} ~ ${r.dateEnd.slice(5).replaceAll(".", "-")}` : r.date.replaceAll(".", "-");
  return `<article class="rec wide">
    <div class="rec-route"><div class="legs">${legs}</div></div>
    <div class="rec-body">
      <div><div class="rec-city"><b class="serif">${r.date.slice(0, 4)}</b><span>${dates}</span></div><div class="rec-event">${r.event} · ${r.team} · ${r.distanceKm} km</div></div>
      <div class="rec-time cond">${fmtT(r.verified)}<small>核实成绩${r.verifiedNote ? "（" + r.verifiedNote + "）" : ""}</small></div>
      <div class="rec-stats"><span>${r.liveLabel} <b>${fmtT(r.live)}</b></span><span>我的赛段 <b>${r.myLegs.length}</b> 段 · <b>${myDist.toFixed(1)}</b> km · <b>${pace(mySec, myDist)}</b>/km · ${myUp} m↑</span></div>
      <div class="rec-meta"><span class="rec-rank">总榜 ${r.rank.overall} · ${r.rank.groupName} ${r.rank.group}</span></div>
    </div></article>`;
}
document.getElementById("records").innerHTML = items.map(card).join("");
