#!/usr/bin/env bash
# Build the web site and copy it to the server folder that pitaka.lk serves as /pirith/.
#
#   bash dev/deploy.sh          build + DRY RUN: shows what would change on the server, changes nothing
#   bash dev/deploy.sh --go     build + deploy
#   bash dev/deploy.sh --go --skip-build    deploy the dist/ that is already there
#
# pitaka.lk is served from the tipitaka.lk droplet (both sites are on it), folder /var/www/html/pitaka.lk.
# Server and folder can be overridden:  DEPLOY_HOST=... DEPLOY_ROOT=... bash dev/deploy.sh
#
# Needs no sudo and no secrets: it only writes files under the web root.
# NEVER run `git pull` in the server's web root - see DEPLOY.md.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${DEPLOY_HOST:-tipitaka.lk}"
ROOT="${DEPLOY_ROOT:-/var/www/html/pitaka.lk}"
GO=0; BUILD=1
for arg in "$@"; do
  case "$arg" in
    --go) GO=1 ;;
    --skip-build) BUILD=0 ;;
    *) echo "unknown option: $arg"; exit 2 ;;
  esac
done

if [ "$BUILD" = 1 ]; then
  npm ci
  npm run build
fi

# safety: never sync an empty or half-built folder over the live site
for must in index.html en/index.html sitemap.xml pages/62-samantha-pattana.html audio/ariyadhamma/09-rathana.m4a; do
  [ -s "dist/$must" ] || { echo "dist/$must is missing - build first"; exit 1; }
done
[ "$(ls dist/pages/*.html | wc -l)" -ge 44 ] || { echo "fewer than 44 pirith pages in dist/pages"; exit 1; }

DRY="--dry-run"; [ "$GO" = 1 ] && DRY=""
echo "== ${DRY:+DRY RUN: }dist/ -> $HOST:$ROOT/pirith/"
# --checksum: a fresh build has new file times; only send files whose content changed
rsync -rltz --checksum --itemize-changes --omit-dir-times --chmod=D755,F644 \
  --exclude=.DS_Store --exclude='._*' --delete $DRY \
  dist/ "$HOST:$ROOT/pirith/"

if [ "$GO" = 1 ]; then
  echo "== deployed. check https://pitaka.lk/pirith/ and https://pitaka.lk/pirith/sitemap.xml"
else
  echo "== dry run only. Lines starting with *deleting are files that would be removed. Run with --go to deploy."
fi
