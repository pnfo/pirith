#!/usr/bin/env bash
# Build the app flavour of the site (hash routing, relative paths, audio included)
# and copy it into the Android and iOS projects.
#
#   bash dev/sync-apps.sh
#
# Android project: ./Android (a symlink to the Pirith-android-app repo) -> app/src/main/assets/
# iOS project:     ./ios -> Pirith/www/
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build:app

copy() { # $1 = destination folder
  mkdir -p "$1"
  rsync -rlt --delete --exclude=.DS_Store --exclude='._*' dist-app/ "$1/"
  echo "== copied to $1 ($(du -sh "$1" | cut -f1))"
}

if [ -d Android/app/src/main ]; then copy Android/app/src/main/assets; else echo "== no Android project at ./Android - skipped"; fi
if [ -d ios/Pirith ]; then copy ios/Pirith/www; else echo "== no iOS project at ./ios - skipped"; fi
