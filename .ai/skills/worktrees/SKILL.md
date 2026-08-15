---
name: worktrees
description: Use when creating, preparing, listing, switching between, or removing git worktrees for the Lattice package, especially when multiple agents work in parallel. Covers the project worktree scripts, safe multi-agent branch isolation, the sibling layout, Testbench setup, verification gates, and cleanup.
---

# Lattice Worktrees

Lattice is a **package developed with Orchestra Testbench**, not a full Laravel app. There is no
Herd site, no Wayfinder, no app `.env`/`key:generate`/`migrate` ritual — the `workbench/` skeleton
and its SQLite database are managed by Testbench. Worktree setup is therefore just dependency
installation plus the project's verification gates.

Use a worktree whenever you need to make changes while other agents may be editing the main checkout
or another branch. Keep each agent's work isolated and never move, reset, delete, or overwrite
another agent's files.

## Layout: siblings of the main checkout

Worktrees live **as siblings of the repo**, directly under its parent directory, named
`lattice-<slug>`:

```text
/Users/bambamboole/Projects/lattice/
  lattice/                      # main checkout (repo root)
  lattice-<slug>/               # a worktree
  lattice-<other-slug>/         # another worktree
```

Do **not** nest worktrees inside the repo (no `.worktrees/`, no `.claude/worktrees/`). Siblings sit
outside the working tree, so they need no `.gitignore` entry and never pollute `git status`.

## First: take stock of existing worktrees

Before creating anything, list what already exists and clean up if it has grown:

```bash
git worktree list
git status --short
git branch --show-current
```

Rules:

- **If there are already many worktrees (roughly 5+), do not silently add another.** Tell the user
  which ones look finished and should be closed first. A worktree is a candidate for closing when
  its branch is merged or its work is done:
  ```bash
  git branch --merged main          # branches already merged — their worktrees can usually go
  git worktree list --porcelain     # match branches back to worktree paths
  ```
- Recommend closing; never remove another agent's worktree yourself. Only the user (or the owning
  agent) closes work you did not create.
- Treat every uncommitted change you did not make as another agent's work — do not clean, stash,
  reset, checkout, or remove it.
- Pick a unique slug and branch name, usually `<task>-<short-slug>`. Do not reuse an existing
  `lattice-<slug>` path or existing branch unless the user explicitly asks.

## Create with the project script

Use the project script from the repo root. It creates the sibling worktree from `main`; the branch
defaults to the worktree name when omitted:

```shell
bin/create-worktree.sh <slug> [branch]
```

The script creates `../lattice-<slug>`, installs Composer and npm dependencies, refreshes the
Boost-generated local agent context, and builds the workbench frontend. Testbench provisions the
`workbench/` skeleton and its SQLite database on demand; there is no Herd site, app `.env`, key
generation, or manual migration step.

Use raw `git worktree add` only when the script cannot express the requested operation, such as
continuing an existing branch or intentionally branching from a commit other than `main`. Reproduce
the script's dependency installation and build steps in that exceptional worktree.

`npm install` refreshes the Laravel Boost guidelines and skills after the frontend package graph is
installed, so package-detected skills such as React, Inertia, and Tailwind are available in fresh
worktrees. The hook skips cleanly when Composer dependencies are not present, which keeps npm-only
CI jobs working. If the guidelines ever look stale or missing, regenerate them on demand:

```bash
composer boost:refresh   # = php artisan boost:update --no-interaction
```

## Verify

Always run both gates in a new worktree before reporting work — they mirror CI:

```bash
composer check    # Pint (test), PHPStan, Pest (Arch + Unit + Feature)
npm run check     # oxlint --fix, oxfmt, tsc, Vitest, build:lib
```

For anything touching rendered UI or browser behavior, also run the browser suite (the strongest
signal):

```bash
composer test:browser
```

Never report green without having run the gates that match what you changed. Backend-only change →
`composer check`. Frontend change → `npm run check`. UI/interaction change → add
`composer test:browser`.

## Serve

Serve the workbench app with Testbench — **not** Herd, **not** `php artisan serve`:

```bash
composer serve
```

(`composer serve` runs `workbench:build` then `testbench serve`.)

## List

```bash
git worktree list
git worktree list --porcelain
```

Use porcelain output when deciding what belongs to another agent.

## Remove with the project script

Only remove a worktree that belongs to your task and has no needed changes. Run from the main repo
root:

```shell
bin/delete-worktree.sh <slug>
```

The script refuses dirty worktrees and deletes the associated branch only when Git considers it
merged. Use `bin/delete-worktree.sh <slug> --force` only when the user explicitly says to discard
that worktree's uncommitted changes and branch. Do not bypass the script with
`git worktree remove --force`.

## Multi-Agent Safety

- Prefer separate sibling worktrees over sharing one dirty checkout.
- Never assume a branch, worktree, or untracked file is disposable.
- Commit only your logical change set.
- If two agents touch the same files, stop and coordinate instead of overwriting.
- When worktrees pile up, surface the list and recommend which to close — don't just add more.
