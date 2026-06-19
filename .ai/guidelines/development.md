# Local Development

- This package is developed with Orchestra Testbench, not a full Laravel app.
- `artisan` at the repo root is a symlink to `vendor/bin/testbench`, so `php artisan <command>` boots the Testbench
  skeleton with this package's service provider and the `workbench/` app.
- Run the test suite with `composer test` or `./vendor/bin/pest`.
- Run browser tests with `composer test:browser`.
- Serve the workbench app with `composer serve`.
- The AI tooling overrides for Boost live in `workbench/app/Support/` and are wired in
  `Workbench\App\Providers\WorkbenchServiceProvider`. They point Boost at the package root instead of the Testbench
  skeleton.
- Regenerate `CLAUDE.md` and `AGENTS.md` after editing files in `.ai/guidelines/` with `php artisan boost:update`.

## Verification

- Before pushing or opening a PR, run `composer check` (Pint, PHPStan, Pest) — it mirrors the CI PHP job. Never push on
  red. `composer test` alone is not enough; PHPStan and Pint run in CI too. For frontend changes run `npm run check` —
  it fixes lint/format, then runs the type check, the Vitest suite, and the library build. CI additionally verifies that
  generated TypeScript types (`composer types`) and docs fixtures are up to date.
- After any change to TypeScript/TSX files (`resources/js/**`, `workbench/resources/js/**`), always run `npm run check`
  before finalizing. It fixes lint and formatting (`oxlint --fix`, `oxfmt`), then runs the type check (`tsc`), the
  Vitest suite, and the library build (`build:lib`).
- The library build is part of the gate on purpose: it is the artifact consumers receive, and it catches bundling
  regressions (e.g. dependencies that must stay external) that the type check and tests do not.

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

## Testing

- Prefer feature tests for backend behavior. Test the application through HTTP endpoints, actions, jobs, commands,
  events, policies, and database effects rather than isolating internals by default.
- Use unit tests only for complex algorithms implemented as pure functions or small deterministic value objects where
  integration coverage would make the important cases hard to see.
- For UI behavior that is not directly about an endpoint's returned payload, use Pest browser tests. This includes
  interactions, client-side state, navigation, visual toggles, JavaScript behavior, and regressions that only appear in
  the browser.
- It is acceptable to add stable test attributes when they make browser assertions clearer or less brittle.

## Translation Conventions

- **Kebab-case keys only**: All translation keys use lowercase letters and dashes. Never use underscores or camelCase. Example: `billing.coming-soon`, not `billing.coming_soon`.
- **Dot notation via nested arrays**: Use nested PHP arrays to create dot-separated keys. Example: `'subscription' => ['heading' => '...']` resolves to `billing.subscription.heading`.
- **`.title` suffix for notification titles**: When a field has both a title and body text, nest them
- **`.label` suffix for form labels**: When a field has both a label and helper text, nest them: `'slug' => ['label' => '...', 'help-text' => '...']`. Reference as `__('team.field.slug.label')`.
- **`.help-text` suffix for helper text**: Use `field-name.help-text` for form helper text. Example: `__('template-designer.margins.help-text')`.
- **`common.*` prefix for reusable strings**: Shared strings like field labels (`common.field.email`), actions (`common.action.save`), and statuses (`common.field.status`) go in `lang/{locale}/common.php`.
- **File naming**: Translation files use kebab-case filenames matching the feature. Example: `template-designer.php`, `document-designer.php`.
- **Both locales**: Always update both `lang/en/` and `lang/de/` when adding or modifying translations.
