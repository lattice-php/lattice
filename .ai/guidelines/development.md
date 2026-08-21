# Local Development

- This package is developed with Orchestra Testbench, not a full Laravel app.
- `artisan` at the repo root is a thin shim requiring `vendor/bin/testbench`, so `php artisan <command>` boots the
  Testbench skeleton with this package's service provider and the `workbench/` app.
- `bambamboole/extended-testbench` rebases `base_path()` (and storage/config/database/bootstrap/lang/public paths) to
  the package root for `boost:*`/`mcp:*` commands specifically, so Laravel Boost's package-guideline and skill
  discovery — which reads `base_path('composer.json')` — sees this monorepo instead of the Testbench skeleton.
- Run the test suite with `composer test` or `./vendor/bin/pest`.
- Run browser tests with `composer test:browser`.
- Serve the workbench app with `composer serve`.
- The AI tooling overrides for Boost live in `workbench/app/Support/` and are wired in
  `Workbench\App\Providers\WorkbenchServiceProvider`. They point Boost at the package root instead of the Testbench
  skeleton.
- Regenerate `CLAUDE.md` and `AGENTS.md` after editing files in `.ai/guidelines/` with `php artisan boost:update`.

## Verification

- Git hooks enforce the gate automatically. `composer install` points `core.hooksPath` at `.githooks/`; if the hooks are
  not active, run `composer install` (or `git config core.hooksPath .githooks`) once.
  - **pre-commit** auto-fixes staged PHP with Pint and Rector, auto-formats staged JS (oxfmt, oxlint), re-stages the
    fixes, then runs PHPStan (both configs) over the whole project and blocks on any error. PHPStan's result cache is
    pinned to `.phpstan-cache/` (gitignored, `parameters.tmpDir` in `phpstan.neon.dist`/`phpstan-tests.neon.dist`) so
    it persists across commits — after the first run, only files that actually changed get re-analysed, keeping the
    hook fast despite running full-project.
  - **pre-push** runs the fast static gate, scoped to what the push changes: Pint and PHPStan on the PHP side (only
    when PHP files changed), `npm run check:push` (lint, format, type check, type coverage, Vitest via `--changed`
    against the push base, library build) on the JS side (only when JS/TS files changed). `check:package`
    (publint/attw) runs only when a package manifest or Vite config changed. Unrecognized file types and unresolvable
    diff bases fail toward the full gate (`npm run check`), and CI always runs everything unscoped. The full Pest
    suite is too slow to run on every push, so it runs in CI and via explicit local runs (`composer test`) instead.
    Its PHPStan run is a safety net for commits made with `--no-verify`; a normal commit has already satisfied it.
- Never push on red. Use `git commit`/`git push --no-verify` only in emergencies.
- The library build is part of the gate on purpose: it is the artifact consumers receive, and it catches bundling
  regressions (e.g. dependencies that must stay external) that the type check and tests do not.
- CI additionally verifies that generated TypeScript types (`composer types`) and docs fixtures are up to date. These are
  left out of the local hooks because a local run reorders `resources/js/types/generated.ts` spuriously; regenerate and
  commit them deliberately only when you change a `#[TypeScript]`/component shape.

## Comments

- Code must be self-explanatory: reach for clear names, small functions, and types before a comment.
- Do not add comments. A comment is a last resort and explains only *why* something is done, never *what* the code does.
- When you encounter an obsolete, redundant, or "what" comment, delete it.
- Delete section banners and navigation comments unless they explain a non-obvious boundary.
- Delete comments that narrate the next line, assertion, or obvious test setup; prefer clearer test names and variable names.
- Keep PHPDoc/JSDoc only when it carries type information, public API intent, static-analysis value, generated-file context,
  or a non-obvious constraint.
- Keep comments that explain framework quirks, ordering requirements, browser/test timing, cache/build behavior, performance
  traps, or other constraints that are hard to infer from the code alone.

## Translation Conventions

- **Lowercase keys only**: Translation key segments may use lowercase letters, numbers, dashes, or underscores. Never use camelCase. Both `billing.coming-soon` and `billing.coming_soon` are valid.
- **Dot notation via nested arrays**: Use nested PHP arrays to create dot-separated keys. Example: `'subscription' => ['heading' => '...']` resolves to `billing.subscription.heading`.
- **`.title` suffix for notification titles**: When a message has both a title and body text, nest them: `'export' => ['title' => 'Export complete', 'body' => 'Your file is ready to download.']`. Reference as `__('team.notification.export.title')` / `.body`.
- **`.label` suffix for form labels**: When a field has both a label and helper text, nest them: `'slug' => ['label' => '...', 'help-text' => '...']`. Reference as `__('team.field.slug.label')`.
- **`.help-text` suffix for helper text**: Use `field-name.help-text` for form helper text. Example: `__('template-designer.margins.help-text')`.
- **`common.*` prefix for reusable strings**: Shared strings like field labels (`common.field.email`), actions (`common.action.save`), and statuses (`common.field.status`) go in `lang/{locale}/common.php`.
- **File naming**: Translation files use kebab-case filenames matching the feature. Example: `template-designer.php`, `document-designer.php`.
- **Both locales**: Always update both `lang/en/` and `lang/de/` when adding or modifying translations.
