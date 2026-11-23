#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_DIR"
pnpm install --frozen-lockfile
pnpm build
