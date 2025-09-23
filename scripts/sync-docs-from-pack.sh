#!/usr/bin/env bash
set -euo pipefail

PACK="IFS_Docs_Pack.md"
FILES=("README.md" "BUILD.md" "TESTER_GUIDE.md" "PROJECT_GUIDE.MD" "INVITATION_TEMPLATE.md" "UPDATE_NOTICE_TEMPLATE.md")

# Ensure we run from repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f "$PACK" ]]; then
  echo "ERROR: $PACK not found in repo root." >&2
  exit 1
fi

# Normalize line endings to LF (doesn't modify original on unsupported systems)
tmp_norm="$(mktemp)"
tr -d '\r' < "$PACK" > "$tmp_norm"

# Parse sections: treat any of the following as a header for a target file:
#   - ### FILENAME
#   - FILENAME
#   - ### `FILENAME`
#   - (any number of leading #'s / spaces / backticks)
awk -v pack="$PACK" '
  BEGIN {
    # list of target filenames
    files["README.md"]; files["BUILD.md"]; files["TESTER_GUIDE.md"];
    files["PROJECT_GUIDE.MD"]; files["INVITATION_TEMPLATE.md"]; files["UPDATE_NOTICE_TEMPLATE.md"];
    for (f in files) { out[f] = ""; }
    current = "";
  }
  {
    line = $0;
    # Match header lines like: ###   `FILENAME.md`   (any case-sensitive filename)
    # Regex groups the filename in m[2]
    if (match(line, /^[[:space:]]*#{0,6}[[:space:]]*`?([A-Za-z0-9_.-]+)`?[[:space:]]*$/, m)) {
      fname = m[1];
      if (fname in files) {
        current = fname;
        next;
      }
    }
    if (current != "") {
      out[current] = out[current] line "\n";
    }
  }
  END {
    missing = 0;
    for (f in files) {
      if (out[f] == "") {
        printf("Section for %s not found in %s\n", f, pack) > "/dev/stderr";
        missing = 1;
      } else {
        # write file content; also ensure trailing newline
        printf("%s", out[f]) > f;
      }
    }
    if (missing) {
      exit 2;
    }
  }
' "$tmp_norm" || true

rm -f "$tmp_norm"
echo "✅ Sync complete. Review changes and commit them."
