#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "用法: $0 <github_user> <worker_base_url>"
  echo "例:   $0 alice https://knowledge-site-oauth.alice.workers.dev"
  exit 1
}

[[ $# -lt 2 ]] && usage

GITHUB_USER="$1"
WORKER_BASE_URL="${2%/}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG_MTS="$REPO_ROOT/docs/.vitepress/config.mts"
CONFIG_YML="$REPO_ROOT/docs/public/admin/config.yml"

sed -i "s/REPLACE_ME/${GITHUB_USER}/g" "$CONFIG_MTS"
sed -i "s/REPLACE_GITHUB_USER/${GITHUB_USER}/g" "$CONFIG_YML"
sed -i "s|https://REPLACE_WORKER.workers.dev|${WORKER_BASE_URL}|g" "$CONFIG_YML"

cd "$REPO_ROOT"
git diff --stat
