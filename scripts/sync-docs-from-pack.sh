#!/usr/bin/env bash
set -euo pipefail

PACK="IFS_Docs_Pack.md"
FILES=("BUILD.md" "README.md" "TESTER_GUIDE.md" "PROJECT_GUIDE.MD" "INVITATION_TEMPLATE.md" "UPDATE_NOTICE_TEMPLATE.md")

[ -f "$PACK" ] || { echo "ERROR: $PACK not found in repo root"; exit 1; }

ts=$(date +%Y%m%d-%H%M%S)
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    cp -f "$f" "$f.BAK.$ts"
  fi
  # truncate target so we write fresh
  : > "$f"
done

# Split sections like:
#   # BUILD.md
#   <content...>
awk '
  BEGIN{out=""}
  /^# [A-Za-z0-9_.-]+\.md$/ {
      out=$2
      sub(/\r$/,"",out)
      next
  }
  { if(out!=""){ print $0 >> out } }
' "$PACK"

echo "Docs synced from $PACK:"
ls -1 "${FILES[@]}" 2>/dev/null
