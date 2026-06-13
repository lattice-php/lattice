---
name: worktrees
description: Use when creating, preparing, listing, switching between, or removing git worktrees for the Lattice package, especially when multiple agents work in parallel. Covers safe multi-agent branch isolation, the sibling worktree layout, Testbench dependency setup, the required verification gates, and cleanup.
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

## Create

Create from a clean base branch (usually `main`) or current `HEAD`. Run from the repo root so `..`
resolves to the parent directory:

```bash
git fetch origin --prune
git worktree add ../lattice-<slug> -b <branch> main
cd ../lattice-<slug>
```

Examples:

```bash
git worktree add ../lattice-dropdown -b feat/dropdown-collapsible main
git worktree add ../lattice-current-fix -b fix/current-fix HEAD
```

Continue an existing branch only when that is the intent:

```bash
git worktree add ../lattice-<slug> <branch>
```

## Set up

Each worktree needs its own ignored dependencies. Always install both stacks:

```bash
composer install
npm install
```

That is the whole setup. Testbench provisions the `workbench/` skeleton and its SQLite database on
demand (via `composer post-autoload-dump` and the test bootstrap); there is no app `.env`, key
generation, or manual `migrate` step to run.

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

## Remove

Only remove a worktree that belongs to your task and has no needed changes.

```bash
cd <repo-root>
git -C ../lattice-<slug> status --short
git worktree remove ../lattice-<slug>
git worktree prune
```

Never use `git worktree remove --force` unless the user explicitly says to discard that worktree's
uncommitted changes.

## Multi-Agent Safety

- Prefer separate sibling worktrees over sharing one dirty checkout.
- Never assume a branch, worktree, or untracked file is disposable.
- Commit only your logical change set.
- If two agents touch the same files, stop and coordinate instead of overwriting.
- When worktrees pile up, surface the list and recommend which to close — don't just add more.
