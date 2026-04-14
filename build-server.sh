#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/frontend"
npm ci
npm run build

cd "$SCRIPT_DIR"
if [ -x "./mvnw" ]; then
  ./mvnw -DskipTests package
else
  mvn -DskipTests package
fi
