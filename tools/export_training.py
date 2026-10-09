#!/usr/bin/env python3
# /// script
# dependencies = ["cryptography"]
# ///
"""从 Obsidian 库里的 Garmin 笔记（~/SynologyDrive/Garmin）抽取训练日志页需要的数据，用 data/training.key 里的口令加密后写到 data/training.enc。

用法：uv run tools/export_training.py   （Obsidian 插件同步完之后跑一次，再 git commit / push；uv 会自动装 cryptography）
"""
import os, re, json, glob, sys, gzip, hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT = os.environ.get("GARMIN_VAULT", os.path.expanduser("~/SynologyDrive/Garmin"))
DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OUT, KEY = os.path.join(DATA, "training.enc"), os.path.join(DATA, "training.key")
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
    return d
DK = ["date","resting_hr","sleep_score","sleep_total_sec","sleep_deep_sec","sleep_rem_sec","hrv","hrv_status","training_readiness_score","training_readiness_level","training_readiness_latest"]  # 页面用到的字段；加字段记得同步 scripts/training.js
AK = ["date","activity_type","activity_group","activity_label","activity_name","distance_km","duration_sec","pace_sec_per_km","training_load","vo2max"]
daily = [fm(p) for p in sorted(glob.glob(f"{ROOT}/Daily/*/*.md"))]
daily = [{k:d.get(k) for k in DK} for d in daily if d.get("date") and d["date"] >= SINCE]
acts = [fm(p) for p in sorted(glob.glob(f"{ROOT}/Activities/*/*.md"))]
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
body = json.dumps({"since":SINCE,"daily":strip(daily),"activities":strip(acts)}, ensure_ascii=False, separators=(",",":")).encode()
# 口令 → PBKDF2-SHA256 → AES-256-GCM 密钥；JSON 先 gzip 再加密；文件 = 16 字节盐 + 12 字节 IV + 密文。scripts/training.js 用 WebCrypto 按同样参数解，改参数两边一起改。
if not os.path.exists(KEY): sys.exit(f"缺少口令文件 {KEY}")
passphrase = open(KEY, encoding="utf-8").read().strip().encode()
salt, iv = os.urandom(16), os.urandom(12)
key = hashlib.pbkdf2_hmac("sha256", passphrase, salt, 600_000, 32)
open(OUT, "wb").write(salt + iv + AESGCM(key).encrypt(iv, gzip.compress(body), None))
print(len(daily),"daily;",len(acts),"activities")
from collections import Counter
print("written", OUT, os.path.getsize(OUT)//1024, "KB")
