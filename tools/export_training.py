#!/usr/bin/env python3
"""从 Obsidian 库里的 Garmin 笔记（~/SynologyDrive/Garmin）抽取训练日志页需要的数据，写到 data/training.json。

用法：python3 tools/export_training.py   （Obsidian 插件同步完之后跑一次，再 git commit / push）
"""
import os, re, json, glob, sys
ROOT = os.environ.get("GARMIN_VAULT", os.path.expanduser("~/SynologyDrive/Garmin"))
VAULT = os.environ.get("TRAINING_VAULT", os.path.expanduser("~/Documents/Obsidian/Daily Vault"))  # 训练记录（type: sports-session，不限文件夹）和 Sports/比赛记录
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "training.json")
SINCE = "2023-01-01"
def fm(path):
    t = open(path, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---", t, re.S)
    d = {}
    if not m: return d
    for line in m.group(1).splitlines():
        if ":" not in line: continue
        k, v = line.split(":", 1); v = v.strip()
        if v == "null": v = None
        elif v.startswith('"'): v = v.strip('"')
        elif v.startswith('['): v = json.loads(v)
        else:
            try: v = float(v) if "." in v else int(v)
            except: pass
        d[k.strip()] = v
    ts = re.search(r"^\| timestamp \| [\d.]+ \| ([\d.]+) \|", t, re.M)  # 正文 FIT 统计表里 timestamp 的最小值 = 开始时间（毫秒）
    if ts: d["start_ts"] = int(float(ts.group(1)) / 1000)
    return d
DK = ["date","resting_hr","sleep_score","sleep_total_sec","sleep_deep_sec","sleep_rem_sec","hrv","hrv_status","training_readiness_score","training_readiness_level","training_readiness_latest"]  # 页面用到的字段；加字段记得同步 scripts/training.js
AK = ["date","activity_type","activity_group","activity_label","activity_name","distance_km","duration_sec","pace_sec_per_km","training_load","vo2max","training_effect_label"]
daily = [fm(p) for p in sorted(glob.glob(f"{ROOT}/Daily/*/*.md"))]
daily = [{k:d.get(k) for k in DK} for d in daily if d.get("date") and d["date"] >= SINCE]
acts = [fm(p) for p in sorted(glob.glob(f"{ROOT}/Activities/*/*.md"))]
# 同一天按开始时间排：文件名是按地点/类型排的。2026-05 之前的笔记没有 FIT 时间戳，用 activity_id 兜底（和真实顺序约 98% 一致），排在当天有时间戳的前面。
acts.sort(key=lambda a: (a.get("date") or "", a.get("start_ts") or 0, a.get("activity_id") or 0))
BEIJING = {"北京","东城区","西城区","朝阳区","海淀区","丰台区","石景山区","门头沟区","房山区","通州区","顺义区","昌平区","大兴区","怀柔区","平谷区","密云区","延庆区"}
LABELS = {"跑步","操场跑步","骑行","网球","徒步","越野跑","步行","游泳","桨板冲浪","恢复训练","力量训练","跑步机","瑜伽","羽毛球","泳池游泳","室内骑行"}
def place(a):
    name = (a.get("activity_name") or "").split(" - ")[0].strip()
    toks = [t for t in name.split() if t not in LABELS]
    if not toks: return None
    cand = " ".join(toks)
    if re.fullmatch(r"[\u4e00-\u9fff]+", cand) and not re.search(r"(区|市|州|盟|县|新界)$", cand): return None  # 室内课名等
    if cand in BEIJING: return "北京"
    ALIAS = {"浦东新区":"上海","长宁区":"上海","新界":"香港","Hillingdon":"伦敦","Fujikawaguchiko Town":"河口湖","Kuala Lumpur":"吉隆坡","Singapore":"新加坡"}
    if cand in ALIAS: return ALIAS[cand]
    return re.sub(r"(市|布依族苗族自治州|苗族侗族自治州|藏族羌族自治州)$", "", cand)
# 训练记录和比赛记录（Obsidian 笔记）→ 每条活动的 session（记录名）和 session_kind（run / strength / race）。
# 训练记录 = 库里所有 type: sports-session 的笔记（从模板新建的常落在库根目录，所以不按文件夹找，只排除 Templates），
# 按 frontmatter 里 garmin_activities 的链接精确对应到活动；比赛记录没有 frontmatter，按文件名里的日期把当天所有活动算进去。
def record_title(path): return re.sub(r"^\d{4}-\d{2}-\d{2}\s*", "", os.path.splitext(os.path.basename(path))[0])
session_by_id, race_by_date = {}, {}
for p in glob.glob(f"{VAULT}/**/*.md", recursive=True):
    if os.path.relpath(p, VAULT).startswith("Templates" + os.sep): continue
    d = fm(p)
    if d.get("type") != "sports-session": continue
    kind = "strength" if str(d.get("training_type") or "").endswith("_strength") else "run"
    for aid in re.findall(r"\[\[Garmin/Activities/[^\]]*-(\d+)\]\]", open(p, encoding="utf-8").read()):
        session_by_id[aid] = (record_title(p), kind)
# 没写比赛记录的比赛从 scripts/data.js 的成绩表拿（有 date + event 的条目：全马、半马、越野），笔记优先。
DATA_JS = os.path.join(os.path.dirname(OUT), "..", "scripts", "data.js")
for y, mo, dd, ev in re.findall(r'date:\s*"(\d{4})\.(\d{2})\.(\d{2})",\s*event:\s*"([^"]+)"', open(DATA_JS, encoding="utf-8").read()):
    race_by_date.setdefault(f"{y}-{mo}-{dd}", ev)
for p in glob.glob(f"{VAULT}/Sports/比赛记录/*.md"):
    m = re.match(r"(\d{4}-\d{2}-\d{2})", os.path.basename(p))
    if m: race_by_date[m.group(1)] = record_title(p)
def session(a):
    if a["date"] in race_by_date: return {"session": race_by_date[a["date"]], "session_kind": "race"}
    t = session_by_id.get(str(a.get("activity_id")))
    return {"session": t[0], "session_kind": t[1]} if t else {}
acts = [dict({k:a.get(k) for k in AK}, place=place(a), **session(a)) for a in acts if a.get("date") and a["date"] >= SINCE]
# 没有记录的日子按训练规律推测（session_inferred: true）。强度课 = 当天有场地跑、或 5 km 以上的 VO₂max / 无氧 / 阈值跑：
# 周三在朝阳区是元大都的 C1 课「元大都强度课」，周二在西城区是月坛的亚瑟士训练营「亚瑟士强度课」，周三其它地方只标「强度课」；
# 周日单次 18 km 以上 = 长距离。用 2026-03 以来有记录的周次校准过：周三零漏，周日漏一次（河口湖那次不到 18 km）。
import datetime
by_day = {}
for a in acts: by_day.setdefault(a["date"], []).append(a)
HARD = {"VO2MAX", "ANAEROBIC_CAPACITY", "LACTATE_THRESHOLD"}
for d, day in by_day.items():
    if any(a.get("session") for a in day): continue
    runs = [a for a in day if a.get("activity_group") == "running"]
    wd = datetime.date.fromisoformat(d).weekday()
    hard = any(a.get("activity_type") == "track_running" or (a.get("training_effect_label") in HARD and (a.get("distance_km") or 0) >= 5) for a in runs)
    district = next((n.split(" ")[0] for a in runs for n in [a.get("activity_name") or ""] if n.split(" ")[0].endswith("区")), None)
    label = None
    if wd == 2 and hard: label = "元大都强度课" if district == "朝阳区" else "强度课"
    if wd == 1 and hard and district == "西城区": label = "亚瑟士强度课"
    if wd == 6 and any((a.get("distance_km") or 0) >= 18 for a in runs): label = "长距离"
    if label:
        for a in runs: a.update(session=label, session_kind="run", session_inferred=True)
strip = lambda rows: [{k:v for k,v in r.items() if v is not None} for r in rows]
json.dump({"since":SINCE,"daily":strip(daily),"activities":strip(acts)}, open(OUT,"w"), ensure_ascii=False, separators=(",",":"))
print(len(daily),"daily;",len(acts),"activities")
from collections import Counter
print("written", OUT, os.path.getsize(OUT)//1024, "KB")
