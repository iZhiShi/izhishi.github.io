#!/bin/zsh
# 定时同步训练数据到网站：从 Obsidian 的 Garmin 笔记导出 data/training.json，有变化就提交并推送。
# 数据提交一周只留一个，信息是 "Update training data (2026-W42)"：本周的数据提交已经在最前面时 amend 进去，
# 再用 --force-with-lease 只替换远端那一个提交；中间有别的提交时另起一个数据提交。
# 由 Claude 桌面端的定时任务调用（见 MAINTENANCE.md 第 10 节）；手动跑也可以。
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd "$(dirname "$0")/.."
echo "---- $(date '+%Y-%m-%d %H:%M:%S')"
python3 tools/export_training.py
git fetch -q origin
subject="Update training data ($(date +%G-W%V))"
replaced=""
if ! git diff --quiet -- data/training.json; then
  if ! git diff --cached --quiet; then echo "暂存区里有别的改动，跳过提交"; exit 1; fi
  git add data/training.json
  if [ "$(git log -1 --format=%s)" = "$subject" ]; then
    replaced=$(git rev-parse HEAD)
    git commit -q --amend --no-edit && echo "amended"
  else
    git commit -q -m "$subject" && echo "committed"
  fi
else
  echo "no change"
fi
remote=$(git rev-parse origin/main)
if git merge-base --is-ancestor "$remote" HEAD; then
  if [ "$(git rev-list --count "$remote"..HEAD)" -gt 0 ]; then git push -q origin HEAD:main && echo "pushed"; fi
elif [ -n "$replaced" ] && [ "$remote" = "$replaced" ]; then
  git push -q --force-with-lease=main:"$replaced" origin HEAD:main && echo "pushed (replaced ${replaced:0:7})"
else
  # 远端有本地没有的提交：把本地的数据提交搬到它上面，training.json 冲突时以刚导出的为准
  git rebase -q --autostash -X theirs origin/main || { git rebase --abort; echo "rebase 失败，没有推送"; exit 1; }
  git push -q origin HEAD:main && echo "pushed (rebased)"
fi
