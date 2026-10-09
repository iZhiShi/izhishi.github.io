#!/bin/zsh
# 定时同步训练数据到网站：从 Obsidian 的 Garmin 笔记导出 data/training.json，有变化就提交，有未推送的提交就推送。
# 由 Claude 桌面端的定时任务调用（见 MAINTENANCE.md 第 10 节）；手动跑也可以。
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd "$(dirname "$0")/.."
echo "---- $(date '+%Y-%m-%d %H:%M:%S')"
python3 tools/export_training.py
if ! git diff --quiet -- data/training.json; then
  if ! git diff --cached --quiet; then echo "暂存区里有别的改动，跳过提交"; exit 1; fi
  git add data/training.json
  git commit -q -m "Update training data ($(date '+%Y-%m-%d %H:%M'))"
  echo "committed"
else
  echo "no change"
fi
git fetch -q origin
if [ "$(git rev-list --count origin/main..HEAD)" -gt 0 ]; then git push -q origin HEAD:main && echo "pushed"; fi
