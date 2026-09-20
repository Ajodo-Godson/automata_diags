#!/usr/bin/env bash
#
# Move node_modules out of iCloud Drive and symlink it back.
#
# This project lives under ~/Documents, which macOS syncs to iCloud Drive. With
# "Optimize Mac Storage" on, iCloud evicts file contents and marks them
# `dataless`; every require() then blocks on a network download. Measured on
# this repo: ~1s per file, so `npm start` never finished.
#
#   $ ls -lO node_modules/big.js/big.js
#   -rw-r--r--@ 1 you staff compressed,dataless 23385 big.js
#
# Run this with the dev server STOPPED — a running webpack holds file handles
# into the tree and the move will block.
#
# Re-run it after any `npm ci`, which deletes node_modules (symlink included)
# before installing. Plain `npm install` leaves the symlink alone.

set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT="$(basename "$(pwd)")"
STORE="$HOME/Library/Application Support/node-modules-store/$PROJECT"

if [ -L node_modules ]; then
    echo "node_modules is already a symlink -> $(readlink node_modules)"
    exit 0
fi

if [ ! -d node_modules ]; then
    echo "No node_modules here. Run 'npm install' first."
    exit 1
fi

if pgrep -f "react-scripts (start|build)" >/dev/null 2>&1; then
    echo "Stop the dev server first (webpack holds handles into node_modules)."
    exit 1
fi

mkdir -p "$(dirname "$STORE")"
rm -rf "$STORE"

echo "Moving node_modules to $STORE ..."
mv node_modules "$STORE"
ln -s "$STORE" node_modules

echo "Done. node_modules -> $(readlink node_modules)"
node -e "require.resolve('react')" && echo "Dependencies resolve through the link."
