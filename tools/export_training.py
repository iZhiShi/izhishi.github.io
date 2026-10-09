#!/usr/bin/env python3
"""从 Obsidian 库里的 Garmin 笔记（~/SynologyDrive/Garmin）抽取训练日志页需要的数据，写到 data/training.json。

用法：python3 tools/export_training.py   （Obsidian 插件同步完之后跑一次，再 git commit / push）
"""
import os, re, json, glob, sys
ROOT = os.environ.get("GARMIN_VAULT", os.path.expanduser("~/SynologyDrive/Garmin"))
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
acts = [dict({k:a.get(k) for k in AK}, place=place(a)) for a in acts if a.get("date") and a["date"] >= SINCE]
strip = lambda rows: [{k:v for k,v in r.items() if v is not None} for r in rows]
json.dump({"since":SINCE,"daily":strip(daily),"activities":strip(acts)}, open(OUT,"w"), ensure_ascii=False, separators=(",",":"))
print(len(daily),"daily;",len(acts),"activities")
from collections import Counter
print("written", OUT, os.path.getsize(OUT)//1024, "KB")
