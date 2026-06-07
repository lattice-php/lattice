# Local Development

- This package is developed with Orchestra Testbench, not a full Laravel app.
- `artisan` at the repo root is a symlink to `vendor/bin/testbench`, so `php artisan <command>` boots the Testbench skeleton with this package's service provider and the `workbench/` app.
- Run the test suite with `composer test` or `./vendor/bin/pest`.
- Run browser tests with `composer test:browser`.
- Serve the workbench app with `composer serve`.
- The AI tooling overrides for Boost live in `workbench/app/Support/` and are wired in `Workbench\App\Providers\WorkbenchServiceProvider`. They point Boost at the package root instead of the Testbench skeleton.
- Regenerate `CLAUDE.md` and `AGENTS.md` after editing files in `.ai/guidelines/` with `php artisan boost:update`.

## Comments

- Code must be self-explanatory: reach for clear names, small functions, and types before a comment.
- Do not add comments. A comment is a last resort and explains only *why* something is done, never *what* the code does.
- When you encounter an obsolete, redundant, or "what" comment, delete it.

## Testing

- Prefer feature tests for backend behavior. Test the application through HTTP endpoints, actions, jobs, commands,
  events, policies, and database effects rather than isolating internals by default.
- Use unit tests only for complex algorithms implemented as pure functions or small deterministic value objects where
  integration coverage would make the important cases hard to see.
- For UI behavior that is not directly about an endpoint's returned payload, use Pest browser tests. This includes
  interactions, client-side state, navigation, visual toggles, JavaScript behavior, and regressions that only appear in
  the browser.
- It is acceptable to add stable test attributes when they make browser assertions clearer or less brittle.
