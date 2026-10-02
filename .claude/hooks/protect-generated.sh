#!/bin/bash
# PreToolUse (Edit|Write): blocks edits to files that GitHub Actions overwrite every day.
path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // ""')
case "$path" in
    */data/reviews.json|*/data/instagram.json|*/images/instagram/*)
        echo "ZABLOKOWANO: $path jest generowany codziennie przez GitHub Actions i ręczna zmiana zostanie nadpisana." >&2
        echo "Zmień skrypt zamiast danych: scripts/fetch-reviews.mjs (opinie) albo scripts/sync-instagram.mjs (Instagram)." >&2
        exit 2 ;;
esac
exit 0
