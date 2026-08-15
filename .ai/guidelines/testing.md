# Testing

## Choosing the test type

- Prefer feature tests for backend behavior. Test the application through HTTP endpoints, actions, jobs, commands,
  events, policies, and database effects rather than isolating internals by default.
- Use unit tests only for complex algorithms implemented as pure functions or small deterministic value objects where
  integration coverage would make the important cases hard to see.
- For UI behavior that is not directly about an endpoint's returned payload, use Pest browser tests. This includes
  interactions, client-side state, navigation, visual toggles, JavaScript behavior, and regressions that only appear in
  the browser.
- It is acceptable to add stable test attributes when they make browser assertions clearer or less brittle.
- Vitest runs from the root `vite.config.ts` only (a `jsdom` and a `browser` project). Never add per-package vitest
  configs or setup files; the setup lives in `packages/framework/resources/js/test/`.
- jsdom is for logic, wiring, and state. The browser project (`*.browser.test.tsx`, `npm run test:browser`) is for
  anything that depends on layout or real input: portals and popovers, drag and resize, viewport breakpoints, focus
  management, scrolling, file inputs, hydration.
- Never stub layout APIs (`getBoundingClientRect`, `ResizeObserver`, `matchMedia` beyond core's `stubMatchMedia`,
  `scrollIntoView`) or patch DOM prototypes to force jsdom through browser-only behavior — write a browser test.
- Browser tests drive real input: locators plus `userEvent` from `vitest/browser`, asserted with
  `await expect.element(...)` and `await expect.poll(...)`. Never `dispatchEvent` with synthetic events — synthetic
  input skips the browser's own focus, capture, and default-action pipeline, which is the thing browser mode exists
  to exercise.

## What a test must earn

Every test must assert an observable behavior change caused by an interaction, input, or state transition. The bar is
the same for Pest and Vitest. Do not write — and delete on sight:

- **Render-only / existence tests**: a component renders, an element or class is present, a page loads and shows static
  text — with no interaction. This includes Pest assertions that a class or component merely exists.
- **Styling pins**: `toHaveClass` on Tailwind utilities, class strings mirrored from the source, inline-style string
  assertions. Assert semantic state instead (`aria-*`, `data-*` state attributes, disabled, focus). A purely
  presentational component usually needs no unit test at all — its look is a browser or visual concern. "The sibling
  test files do it" is not a reason; those files were deliberately cleaned.
- **Absence-only assertions**: `not.toBeInTheDocument()` / `assertDontSee()` on initial render. Absence is only
  meaningful after the same test establishes the positive case through an interaction (open shows content, close
  removes it).
- **Tautologies**: asserting a mock returns what it was configured to return, prop-to-attribute pass-through,
  constants, re-export identity.
- **Obsolete regression pins**: tests named after completed refactors, `not.toHaveClass` for classes that no longer
  exist, guards for finished file moves.
- **Duplicated coverage**: every behavior has exactly one owning test. Do not re-assert a lower layer's contract
  (condition DSL, field scoping, cell renderers, formatting) in every consumer.
- **Implementation-detail pins**: mock call wiring, React element internals, DOM nesting, render counts — except where
  fine-grained subscription is the module's documented contract.

## Keep behavior in its owning package

Before writing a test, identify the lowest package that owns the behavior. Reusable behavior belongs in that
package's Pest or Vitest suite, not in framework, workbench, docs, or every consumer. If an external dependency owns
the behavior, add or fix its upstream test instead of creating a Lattice test as a substitute. Keep cross-package
integration, Lattice-specific adapters, and local configuration coverage at their observable consumer boundary.

## Test helpers (TypeScript)

- Reuse the owned helpers before writing local ones: `@lattice-php/core/test-support` (`fakeNode`,
  `renderWithRegistry`, `jsonResponse`, `stubFetch`, `stubClipboard`, `stubMatchMedia`, `FakeXhr`, `TextProbe`),
  `@lattice-php/core/browser-test-support` (`renderWithRegistry` for browser suites only — it imports
  vitest-browser-react), `@lattice-php/form/test-support` (`fakeFormContext`, `renderField`, `createFieldRenderer`,
  `renderWithForm`), `@lattice-php/ui/test/inertia-mock` and `@lattice-php/ui/test/effect-fixture`, and
  `packages/table/resources/js/test-support.ts` for table wire fixtures.
- A helper needed by two or more test files moves to the `test-support` of the lowest package that owns its concepts —
  never upward into framework, never copy-pasted sideways.
- Helpers are source-only: excluded from library builds and never added to package exports.
