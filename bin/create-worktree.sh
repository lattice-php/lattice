#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
    echo "Usage: bin/create-worktree.sh <name> [branch]" >&2
    exit 1
fi

name="$1"
branch="${2:-$1}"

if [[ ! "$name" =~ ^[a-zA-Z0-9._-]+$ ]]; then
    echo "error: <name> may only contain letters, numbers, dots, dashes, underscores" >&2
    exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
worktree_dir="$(dirname "$repo_root")/lattice-$name"

if [[ -e "$worktree_dir" ]]; then
    echo "error: $worktree_dir already exists" >&2
    exit 1
fi

git -C "$repo_root" worktree add "$worktree_dir" -b "$branch" main
cd "$worktree_dir"

composer install
npm install
npm run build
