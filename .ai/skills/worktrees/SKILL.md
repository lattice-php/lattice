---
name: worktrees
description: Use when creating, preparing, listing, switching between, or removing git worktrees for this Almanac Laravel application, especially when multiple agents are working in parallel. Covers safe multi-agent branch isolation, dependency setup, per-worktree SQLite databases, Laravel Herd links, Vite/Wayfinder build steps, verification, and cleanup.
---

# Almanac Worktrees

Use a worktree whenever an agent needs to make changes while other agents may be editing the main checkout or another branch. Keep each agent's work isolated and never move, reset, delete, or overwrite another agent's files.

## First Checks

Run these before creating or removing anything:

```bash
git status --short
git worktree list --porcelain
git branch --show-current
```

Rules:
- Treat every uncommitted change you did not make as another agent's work.
- Do not clean, stash, reset, checkout, or remove unrelated changes.
- Pick a unique worktree name and branch name, usually `<agent-or-task>-<short-slug>`.
- Do not reuse an existing `.worktrees/<name>` path or existing branch unless the user explicitly asks.

## Location

Preferred local layout:

```text
.worktrees/<name>
```

Before using `.worktrees/`, verify it is ignored:

```bash
git check-ignore -q .worktrees
```

If it is not ignored, do not silently add it during unrelated work. Either ask to add `.worktrees/` to `.gitignore`, or use:

```text
~/.config/superpowers/worktrees/almanac/<name>
```

## Create

Create from a clean base branch or current `HEAD`. Do not assume dirty files in the current checkout should be copied.

```bash
git fetch --all --prune
git worktree add .worktrees/<name> -b <branch> <base>
cd .worktrees/<name>
```

Examples:

```bash
git worktree add .worktrees/codex-dav-tests -b feat/dav-tests main
git worktree add .worktrees/codex-current-fix -b fix/current-fix HEAD
```

Use an existing branch only when continuing that branch:

```bash
git worktree add .worktrees/<name> <branch>
```

## Set Up Almanac

Each worktree needs its own ignored dependencies and local SQLite database.

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --force
```

Seed only when the task needs demo data or manual UI testing:

```bash
php artisan db:seed --force
```

If routes, controllers, or Wayfinder output changed:

```bash
php artisan wayfinder:generate
```

## Herd

Almanac is served by Laravel Herd. Do not run `php artisan serve` for this app.

For browser/manual testing from a worktree, link a unique Herd site:

```bash
herd link almanac-<name> --secure --update-env
```

Use the resulting `https://almanac-<name>.test` URL. If no browser/manual testing is needed, skip Herd linking and run CLI tests directly.

Cleanup the Herd link when deleting the worktree:

```bash
herd unlink almanac-<name>
```

## Verify

Run the smallest relevant checks while developing. Before reporting work as complete, run the checks that match the touched areas.

Backend/PHP:

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
```

Frontend:

```bash
npm run lint:check
npm run types:check
npm run build
```

Route/controller changes that frontend calls:

```bash
php artisan wayfinder:generate
```

DAV/contact/calendar changes usually need focused tests first:

```bash
php artisan test --compact tests/Feature/Dav
php artisan test --compact tests/Feature/ContactsPageTest.php tests/Feature/Calendar
```

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
git -C .worktrees/<name> status --short
git worktree remove .worktrees/<name>
git worktree prune
```

Never use `git worktree remove --force` unless the user explicitly says to discard that worktree's uncommitted changes.

If the worktree used a Herd link:

```bash
herd unlink almanac-<name>
```

## Multi-Agent Safety

- Prefer separate worktrees over sharing one dirty checkout.
- Never assume a branch, worktree, or untracked file is disposable.
- Commit only your logical change set.
- Keep generated files scoped: Wayfinder output is expected after route/controller changes; avoid unrelated build artifacts.
- If two agents touch the same files, stop and coordinate instead of overwriting.
