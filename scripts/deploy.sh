#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/akhtam"
BRANCH="main"

cd "$APP_DIR"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Deployment stopped: tracked files have local changes." >&2
  exit 1
fi

git fetch --prune origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

npm ci
npm audit --omit=dev
npm run typecheck
npm run lint
npm run build

pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

curl --fail --silent --show-error --retry 10 --retry-delay 2 http://127.0.0.1:3000/ >/dev/null
echo "Deployment completed successfully."
