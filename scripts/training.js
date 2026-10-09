import { marathonResults } from "./data.js";
performance.mark("training:fetch");
const data = await (await fetch("data/training.json")).json();
performance.mark("training:parsed");
const daily = data.daily, acts = data.activities;
const byDate = Object.fromEntries(daily.map(d => [d.date, d]));
const actsByDate = {}; for (const a of acts) (actsByDate[a.date] ||= []).push(a);
const last = daily[daily.length - 1];
const TODAY = last.date;
const raceByDate = Object.fromEntries(marathonResults.map(r => [r.date.replaceAll(".", "-"), r]));
const FONT = '"Avenir Next","PingFang SC",sans-serif';
const fmtPace = s => s ? `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,"0")}` : "";
const fmtMin = s => `${Math.round(s/60)}′`;
const fmtH = s => `${Math.floor(s/3600)}h${String(Math.round((s%3600)/60)).padStart(2,"0")}`;
const avg = arr => { const v = arr.filter(x => x != null); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };
const lastN = (n, key) => daily.slice(-n).map(d => d[key]);
const kind = a => a.activity_group === "strength" ? "strength" : a.activity_type === "track_running" ? "track" : a.activity_type === "treadmill_running" ? "treadmill" : a.activity_group === "running" ? "run" : "other";
// Garmin 对每次跑步的训练效果判定（training_effect_label）。按心率和负荷算出来的效果，不是课表结构：间歇课通常落在 VO₂max / 无氧，但硬拉的马拉松也会被判成 VO₂max。
const EFFECT = { RECOVERY:"恢复", AEROBIC_BASE:"有氧", TEMPO:"节奏", LACTATE_THRESHOLD:"阈值", VO2MAX:"VO₂max", ANAEROBIC_CAPACITY:"无氧", SPEED:"冲刺" };

document.getElementById("syncNote").textContent = `最近同步 ${TODAY}`;
document.getElementById("todayNote").textContent = `${TODAY} · 今晨`;

// ---- tiles
const vo2 = [...acts].reverse().find(a => a.vo2max)?.vo2max;
const vo2prev = [...acts].reverse().filter(a => a.vo2max).find(a => a.vo2max !== vo2)?.vo2max;
const hrv7 = avg(lastN(7, "hrv")), hrvBase = avg(daily.slice(-28, -7).map(d => d.hrv));
const rhr7 = avg(lastN(7, "resting_hr"));
const load7 = acts.filter(a => a.date > shift(TODAY, -7)).reduce((s,a)=>s+(a.training_load||0),0);
const load28 = acts.filter(a => a.date > shift(TODAY, -28)).reduce((s,a)=>s+(a.training_load||0),0) / 4;
const acwr = load28 ? load7 / load28 : null;
const readyLv = { POOR:["偏低","bad"], LOW:["较低","ok"], MODERATE:["中等","ok"], HIGH:["良好","good"], PRIME:["最佳","good"] }[last.training_readiness_level] || ["—","flat"];
const hrvLv = { BALANCED:["平衡","good"], UNBALANCED:["失衡","ok"], LOW:["偏低","bad"], POOR:["差","bad"] }[last.hrv_status] || ["—","flat"];
// 全部按本地（北京）日期处理，不走 toISOString（那会转成 UTC，北京 0 点变成前一天 16 点）。
function isoLocal(t) { return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`; }
function shift(d, n) { const t = new Date(d + "T00:00:00"); t.setDate(t.getDate()+n); return isoLocal(t); }
function spark(id, vals, color) {
  const el = document.getElementById(id); const c = echarts.init(el, null, { renderer:"svg" });
  c.setOption({ animation:false, grid:{left:0,right:0,top:2,bottom:2}, xAxis:{type:"category",show:false,data:vals.map((_,i)=>i)}, yAxis:{type:"value",show:false,scale:true},
    series:[{type:"line",data:vals,smooth:.4,symbol:"none",lineStyle:{color,width:1.6},areaStyle:{color,opacity:.12}}] });
}
const tiles = [
  { name:"晨起训练准备度", val:last.training_readiness_score, unit:"/100", pill:readyLv, sub:`7 日均 ${Math.round(avg(lastN(7,"training_readiness_score")))}${last.training_readiness_latest != null && last.training_readiness_latest !== last.training_readiness_score ? ` · 最新 ${last.training_readiness_latest}` : ""}`, gauge:true },
  { name:"HRV 状态", val:last.hrv, unit:"ms", pill:hrvLv, sub:`7 日均 ${Math.round(hrv7)} · 基线 ${Math.round(hrvBase)}`, spark:lastN(14,"hrv"), color:"#2f7c53" },
  { name:"静息心率", val:last.resting_hr, unit:"bpm", pill:[`${last.resting_hr - Math.round(rhr7) >= 0 ? "+" : ""}${last.resting_hr - Math.round(rhr7)} vs 7日`, Math.abs(last.resting_hr-rhr7)>4?"ok":"flat"], sub:`7 日均 ${Math.round(rhr7)}`, spark:lastN(14,"resting_hr"), color:"#e34948" },
  { name:"睡眠", val:last.sleep_score, unit:"分", pill:[fmtH(last.sleep_total_sec), last.sleep_score>=70?"good":last.sleep_score>=50?"ok":"bad"], sub:`深睡 ${fmtH(last.sleep_deep_sec)} · REM ${fmtH(last.sleep_rem_sec)}`, spark:lastN(14,"sleep_score"), color:"#7a5fd0" },
  { name:"VO₂max", val:vo2, unit:"", pill:[vo2prev ? (vo2>vo2prev?`↑ 从 ${vo2prev}`:`↓ 从 ${vo2prev}`) : "—", vo2>vo2prev?"good":"flat"], sub:"最近一次路跑估算", spark:acts.filter(a=>a.vo2max).slice(-14).map(a=>a.vo2max), color:"#2a78d6" },
  { name:"训练负荷", val:Math.round(load7), unit:"7 日", pill:[acwr ? `负荷比 ${acwr.toFixed(2)}` : "—", acwr>1.5?"bad":acwr>1.2?"ok":acwr<0.8?"ok":"good"], sub:`28 日周均 ${Math.round(load28)}`, spark:weeklyLoads(8), color:"#eda100" },
];
function weeklyLoads(n) { const out=[]; for (let i=n-1;i>=0;i--) { const to=shift(TODAY,-7*i), from=shift(to,-7); out.push(Math.round(acts.filter(a=>a.date>from&&a.date<=to).reduce((s,a)=>s+(a.training_load||0),0))); } return out; }
document.getElementById("tiles").innerHTML = tiles.map((t,i) => `
  <div class="tile"><span class="tile-name">${t.name}</span>
    <div class="tile-main">${t.gauge ? `<svg class="gauge" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="rgba(67,81,68,.15)" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="${t.pill[1]==="bad"?"#e34948":t.pill[1]==="ok"?"#eda100":"#2f7c53"}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(t.val/100*163.4).toFixed(1)} 163.4" transform="rotate(-90 32 32)"/></svg>` : ""}
      <div><span class="tile-val">${t.val ?? "—"}</span> <span class="tile-unit">${t.unit}</span></div></div>
    ${t.spark ? `<div class="spark" id="sp${i}"></div>` : ""}
    <div class="tile-sub"><span>${t.sub}</span><span class="pill ${t.pill[1]}">${t.pill[0]}</span></div></div>`).join("");
tiles.forEach((t,i) => t.spark && spark(`sp${i}`, t.spark, t.color));

// ---- calendar
let view = new Date(TODAY + "T00:00:00"); if (view.getDate() < 10) view.setMonth(view.getMonth()-1); view.setDate(1);
// 下拉列到当月为止（默认视图在 1–9 号是上个月，但当月也要能选）
const months = []; { const first = new Date(daily[0].date + "T00:00:00"); first.setDate(1); const last = new Date(TODAY + "T00:00:00"); last.setDate(1); for (const d = new Date(first); d <= last; d.setMonth(d.getMonth()+1)) months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); }
const titleEl = document.getElementById("calTitle");
titleEl.innerHTML = months.map(m => `<option value="${m}">${m.slice(0,4)} 年 ${+m.slice(5)} 月</option>`).join("");
titleEl.onchange = () => { view = new Date(titleEl.value + "-01T00:00:00"); renderCal(); };
// 地点推断（Garmin 每日记录和室内活动都不带定位，只能这样拼）：
// 1) 手填的行程 trips（上线后放进 data.js）> 2) 户外活动 GPS > 3) 比赛日及前一天 = 赛事城市 > 4) 前后都在同一外地的空档日（≤2 天）
const trips = []; // 例：{ from: "2026-09-18", to: "2026-09-20", place: "呼和浩特" }；比赛日和前一天会自动算作赛事城市，不用填
const raceCity = ev => ({ 海淀马拉松: "北京" })[ev] || ev.replace(/马拉松$/, "");
const gpsPlace = iso => { const ps = (actsByDate[iso]||[]).map(a => a.place).filter(Boolean); return ps.find(p => p !== "北京") || ps[0] || null; };
const placeCache = {};
const dayPlace = iso => {
  if (iso in placeCache) return placeCache[iso];
  let p = trips.find(t => iso >= t.from && iso <= t.to)?.place || gpsPlace(iso);
  if (!p) { const r = raceByDate[iso] || raceByDate[shift(iso, 1)]; if (r) p = raceCity(r.event); }
  if (!p) { const a = gpsPlace(shift(iso,-1)) || gpsPlace(shift(iso,-2)), b = gpsPlace(shift(iso,1)) || gpsPlace(shift(iso,2)); if (a && a === b && a !== "北京") p = a; }
  return (placeCache[iso] = p || null);
};
const DOW = ["一","二","三","四","五","六","日"];
function renderCal() {
  const y = view.getFullYear(), m = view.getMonth();
  titleEl.value = `${y}-${String(m+1).padStart(2,"0")}`;
  const first = new Date(y, m, 1), offset = (first.getDay()+6)%7;
  const start = new Date(y, m, 1 - offset);
  let html = DOW.map(d => `<div class="dow">周${d}</div>`).join("") + `<div class="dow wkh">周小结</div>`;
  let monthKm = 0, monthRuns = 0, monthStr = 0, monthMin = 0;
  for (let w = 0; w < 6; w++) {
    let wkKm = 0, wkStr = 0, wkMin = 0;
    const rowStart = new Date(start); rowStart.setDate(start.getDate() + w*7);
    if (rowStart.getMonth() !== m && rowStart > first) break;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + w*7 + i);
      const iso = isoLocal(d);
      const inMonth = d.getMonth() === m;
      const list = actsByDate[iso] || [], race = raceByDate[iso], dd = byDate[iso];
      let chips = "";
      for (const a of list) {
        const k = kind(a);
        if (race && k === "run" && a.distance_km > 40) { chips += `<div class="chip race"><span>${race.event}</span><small>${race.time.replace(/^0/,"")}</small></div>`; }
        else if (k === "strength") chips += `<div class="chip strength"><span>力量</span><small>${fmtMin(a.duration_sec)}</small></div>`;
        else if (k === "other") chips += `<div class="chip other"><span>${a.activity_label}</span><small>${fmtMin(a.duration_sec)}</small></div>`;
        else chips += `<div class="chip ${k}"><span>${k==="track"?"场地 ":k==="treadmill"?"跑步机 ":""}${EFFECT[a.training_effect_label] ? EFFECT[a.training_effect_label] + " " : ""}${a.distance_km.toFixed(1)}k</span><small>${fmtPace(a.pace_sec_per_km)}</small></div>`;
        if (inMonth) { if (a.activity_group === "running") { monthKm += a.distance_km; monthRuns++; } if (k==="strength") monthStr++; monthMin += a.duration_sec; }
        if (a.activity_group === "running") wkKm += a.distance_km; if (k==="strength") wkStr++; wkMin += a.duration_sec;
      }
      const rd = dd?.training_readiness_score != null && iso <= TODAY ? `<span class="rd" title="晨起训练准备度">${dd.training_readiness_score}</span>` : "";
      const place = dayPlace(iso); const away = place && place !== "北京";
      const loc = away ? `<div class="loc">✈ ${place}</div>` : "";
      html += `<div class="day${inMonth?"":" out"}${iso===TODAY?" today":""}${race?" race":""}${away?" away":""}"><div class="n"><b>${d.getDate()}</b>${rd}</div>${loc}${chips}</div>`;
    }
    html += `<div class="wk"><span>跑量<b>${wkKm.toFixed(1)}<small style="font-size:.7rem"> km</small></b></span><span class="s">力量 ${wkStr} 次</span><span>总时长 ${fmtH(wkMin)}</span></div>`;
  }
  document.getElementById("cal").innerHTML = html;
  document.getElementById("monthSum").innerHTML = `<span><b>${monthKm.toFixed(0)}</b>km 月跑量</span><span><b>${monthRuns}</b>次跑步</span><span><b>${monthStr}</b>次力量</span><span><b>${fmtH(monthMin)}</b>总时长</span>`;
}
renderCal();

// ---- weekly volume
const weeks = []; for (let i = 11; i >= 0; i--) { const to = shift(TODAY, -7*i), from = shift(to, -7); const w = acts.filter(a => a.date > from && a.date <= to);
  weeks.push({ label: from.slice(5).replace("-", "/"), run: w.filter(a=>a.activity_type==="running").reduce((s,a)=>s+a.distance_km,0), track: w.filter(a=>a.activity_type==="track_running").reduce((s,a)=>s+a.distance_km,0), tm: w.filter(a=>a.activity_type==="treadmill_running").reduce((s,a)=>s+a.distance_km,0), str: w.filter(a=>a.activity_group==="strength").length }); }
const base = { animationDuration: 600, textStyle:{fontFamily:FONT}, tooltip:{trigger:"axis", backgroundColor:"#fffaf0", borderColor:"rgba(67,81,68,.2)", textStyle:{color:"#223027", fontSize:12}} };
echarts.init(document.getElementById("weekly")).setOption({ ...base, grid:{left:36,right:36,top:20,bottom:28}, legend:{show:false},
  xAxis:{type:"category",data:weeks.map(w=>w.label),axisLine:{lineStyle:{color:"rgba(67,81,68,.25)"}},axisTick:{show:false},axisLabel:{color:"#5f685e",fontSize:11}},
  yAxis:[{type:"value",name:"km",nameTextStyle:{color:"#5f685e"},splitLine:{lineStyle:{color:"rgba(67,81,68,.1)"}},axisLabel:{color:"#5f685e"}},{type:"value",min:0,max:6,interval:2,name:"次",nameTextStyle:{color:"#1c5cab"},splitLine:{show:false},axisLabel:{color:"#1c5cab"}}],
  series:[
    {name:"路跑",type:"bar",stack:"km",data:weeks.map(w=>+w.run.toFixed(1)),itemStyle:{color:"#eda100",borderRadius:[0,0,0,0]},barWidth:"46%"},
    {name:"场地",type:"bar",stack:"km",data:weeks.map(w=>+w.track.toFixed(1)),itemStyle:{color:"#c98500"}},
    {name:"跑步机",type:"bar",stack:"km",data:weeks.map(w=>+w.tm.toFixed(1)),itemStyle:{color:"rgba(237,161,0,.4)",borderRadius:[4,4,0,0]}},
    {name:"力量课次",type:"line",yAxisIndex:1,data:weeks.map(w=>w.str),symbol:"circle",symbolSize:8,lineStyle:{color:"#2a78d6",width:2},itemStyle:{color:"#2a78d6",borderColor:"#fff",borderWidth:2}},
  ]});

// ---- load (ACWR)
const days = []; for (let i = 89; i >= 0; i--) days.push(shift(TODAY, -i));
const dayLoad = days.map(d => (actsByDate[d]||[]).reduce((s,a)=>s+(a.training_load||0),0));
const roll = (arr, n, avgIt=false) => arr.map((_,i) => { const s = arr.slice(Math.max(0,i-n+1), i+1).reduce((a,b)=>a+b,0); return avgIt ? s/n*7 : s; });
const acute = roll(dayLoad, 7), chronic = roll(dayLoad, 28, true);
const axisX = { type:"category", data: days.map(d=>d.slice(5)), axisLine:{lineStyle:{color:"rgba(67,81,68,.25)"}}, axisTick:{show:false}, axisLabel:{color:"#5f685e",fontSize:10,interval:14} };
const axisY = extra => ({ type:"value", scale:true, splitLine:{lineStyle:{color:"rgba(67,81,68,.1)"}}, axisLabel:{color:"#5f685e",fontSize:10}, ...extra });
echarts.init(document.getElementById("load")).setOption({ ...base, grid:{left:36,right:12,top:20,bottom:28}, xAxis: axisX, yAxis: axisY({}),
  series:[ {name:"日负荷",type:"bar",data:dayLoad.map(v=>+v.toFixed(0)),itemStyle:{color:"rgba(237,161,0,.35)"},barWidth:"60%"},
    {name:"7 日急性",type:"line",data:acute.map(v=>+v.toFixed(0)),symbol:"none",lineStyle:{color:"#c98500",width:2}},
    {name:"28 日慢性（周均）",type:"line",data:chronic.map(v=>+v.toFixed(0)),symbol:"none",lineStyle:{color:"#223027",width:1.5,type:"dashed"}} ]});

// ---- recovery trends
const d90 = days.map(d => byDate[d] || {});
const ma = arr => arr.map((_,i) => { const w = arr.slice(Math.max(0,i-6), i+1).filter(v=>v!=null); return w.length ? +(w.reduce((a,b)=>a+b,0)/w.length).toFixed(1) : null; });
function trend(id, raw, color, extra={}) {
  echarts.init(document.getElementById(id)).setOption({ ...base, grid:{left:30,right:8,top:10,bottom:22}, xAxis: axisX, yAxis: axisY(extra.y||{}),
    series:[ {type:"line",data:raw,symbol:"none",lineStyle:{color,width:1,opacity:.35},connectNulls:true},
      {type:"line",data:ma(raw),symbol:"none",smooth:.3,lineStyle:{color,width:2.4},connectNulls:true, ...(extra.band?{markArea:{silent:true,itemStyle:{color,opacity:.1},data:[[{yAxis:extra.band[0]},{yAxis:extra.band[1]}]]}}:{})}, ...(extra.series||[]) ]});
}
const hrvArr = d90.map(d=>d.hrv ?? null), rhrArr = d90.map(d=>d.resting_hr ?? null), slpArr = d90.map(d=>d.sleep_score ?? null), rdyArr = d90.map(d=>d.training_readiness_score ?? null);
trend("cHrv", hrvArr, "#2f7c53", { band:[Math.round(hrvBase*0.85), Math.round(hrvBase*1.15)] });
trend("cRhr", rhrArr, "#e34948");
trend("cSleep", slpArr, "#7a5fd0", { series:[{type:"bar",data:d90.map(d=>d.sleep_total_sec?+(d.sleep_total_sec/3600).toFixed(1):null),yAxisIndex:0,itemStyle:{color:"rgba(122,95,208,.15)"},barWidth:"55%",z:0}] });
trend("cReady", rdyArr, "#eda100", { y:{min:0,max:100} });
document.getElementById("tHrv").textContent = `${last.hrv} ms · 7日 ${Math.round(hrv7)}`;
document.getElementById("tRhr").textContent = `${last.resting_hr} bpm · 7日 ${Math.round(rhr7)}`;
document.getElementById("tSleep").textContent = `${last.sleep_score} · ${fmtH(last.sleep_total_sec)}`;
document.getElementById("tReady").textContent = `${last.training_readiness_score} · ${readyLv[0]}`;
window.addEventListener("resize", () => document.querySelectorAll(".chart,.trend .c,.spark").forEach(el => echarts.getInstanceByDom(el)?.resize()));
performance.mark("training:rendered");
