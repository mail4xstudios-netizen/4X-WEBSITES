#!/usr/bin/env bash
# Pull the latest code and restart. Run as root: bash /opt/4xcms/deploy/update.sh
set -euo pipefail
cd /opt/4xcms
git pull
npm ci
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
systemctl restart 4xcms
systemctl --no-pager status 4xcms | head -5
