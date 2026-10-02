#!/bin/bash
# PreToolUse (Bash): blocks git commit/push when changes contain API keys or tokens.
# The repo is PUBLIC - anything committed is visible to everyone.
cmd=$(jq -r '.tool_input.command // ""')
echo "$cmd" | grep -qE 'git[^|;&]*\b(commit|push)\b' || exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0
PATTERN='AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'

{
    git --no-pager diff HEAD </dev/null 2>/dev/null | grep '^+'                 # staged + unstaged tracked changes
    git --no-pager log origin/main..HEAD -p </dev/null 2>/dev/null | grep '^+'  # local commits not pushed yet
    git ls-files --others --exclude-standard </dev/null 2>/dev/null | while IFS= read -r f; do
        [ -f "$f" ] && cat "$f" 2>/dev/null                                     # new untracked files
    done
} | grep -oE "$PATTERN" | head -3 > /tmp/gwar-secret-hits.$$

if [ -s /tmp/gwar-secret-hits.$$ ]; then
    echo "ZABLOKOWANO: w zmianach jest coś, co wygląda na klucz API/token:" >&2
    sed -E 's/^(.{8}).*/  \1…/' /tmp/gwar-secret-hits.$$ >&2
    echo "Repo jest PUBLICZNE. Usuń klucz z plików i trzymaj go w sekretach GitHuba (Settings → Secrets and variables → Actions)." >&2
    rm -f /tmp/gwar-secret-hits.$$
    exit 2
fi
rm -f /tmp/gwar-secret-hits.$$
exit 0
