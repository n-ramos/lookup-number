#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PREPARE=false

if [[ "${1:-}" == "--prepare" ]]; then
  PREPARE=true
fi

echo "[sync] project: $ROOT_DIR"
echo "[sync] started: $(date '+%Y-%m-%d %H:%M:%S')"

if [[ "$PREPARE" == "true" ]]; then
  echo "[sync] prepare mode enabled"
  echo "[sync] docker compose up -d"
  docker compose up -d

  echo "[sync] pnpm install"
  pnpm install

  echo "[sync] node ace migration:run"
  node ace migration:run
fi

echo "[sync] node ace sync:arcep"
node ace sync:arcep

echo "[sync] completed: $(date '+%Y-%m-%d %H:%M:%S')"
