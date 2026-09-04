---
paths:
  - 'packages/*/resources/js/**'
---

# Js

## Date/time handling lives in ui format/temporal.ts
Wire dates are ISO strings (Y-m-d, end-exclusive ranges); PHP uses Carbon. All JS date/time logic goes through @lattice-php/ui/format/temporal — never hand-roll date math in a component package and never import @internationalized/date directly. Decision (2026-08-07): back temporal.ts with @internationalized/date (Temporal-aligned, planned upstream Temporal backing; 8kB brotli), imported ONLY inside that module; typed CalendarDate/ZonedDateTime internals, string parsing at the wire edge. isoWeek stays hand-rolled at UTC noon (the library exposes no ISO week numbers); daysBetween diffs toDate("UTC") epochs because compare() documents only its sign.
TODO: form's time-picker parseTimeString stays hand-rolled — the library's parseTime has a different contract (2-digit hour required, minute optional, constrains out-of-range values instead of rejecting).

## Providers own their contexts
A raw React context object never leaves its module: keep createContext() results file-private and expose a wrapper provider component plus a hook instead (CollapsedProvider/useCollapsed, RegistryProvider, OutletProvider/useOutlet, EmbeddedModalProvider/useEmbeddedModal, ModalHostProvider/useModal). Tests provide state through the wrapper provider, never through Context.Provider. useOptionalModal() exists for callers that defer the missing-host error until interaction. A context that is a private implementation detail of one compound component (tabs, wizard, tree) may render its own Context.Provider inline — that is the only place a raw .Provider should appear.

## components/ vs primitives/ package layout
Every JS package splits into components/ and primitives/. components/ holds wire node types that exist in PHP: one folder per node (closely related nodes may share, like wizard/wizard-step), containing <name>-adapter.tsx with a *Adapter export registered in plugin.ts, the props-based client <name>.tsx beside it, and heavy clients lazy-split into <name>-view.tsx — the wrapper owns Suspense, never the registry entry. primitives/ holds props-based building blocks shared across components with no wire knowledge. Never keep primitives/x next to components/x — the client lives in the component folder. Form controls (input, combobox, pickers, form-field, …) live in the form package; native-select stays in ui because ui's tabs uses it. Shared per-package helpers live by lowest owner (form: components/base/ for field chrome, components/rows/ for the repeater/builder row family).

## Text-content matchers differ between browser and jsdom tests
Vitest 5 made its own `toHaveTextContent` exact-equality and moved substring/regex matching to `toMatchTextContent`. Browser tests (`*.browser.test.tsx`) use Vitest's matchers, so assert substrings with `expect.element(...).toMatchTextContent(...)`. jsdom tests use `@testing-library/jest-dom`, whose `toHaveTextContent` still matches substrings — keep it there, but pass a string, never a RegExp: Vitest's own `(string | number)` declaration wins at type-check time even though jest-dom's implementation runs. Related: `browser.locators.exact: false` in the root `vite.config.ts` restores substring locator matching (Vitest 5 defaults to exact), which `getByRole("button", { name })` needs where a label grows a loading prefix.

## Browser drag-and-drop tests must not aim at cell boundaries
Vitest 5 no longer CSS-scales the tester iframe, so `sourcePosition`/`targetPosition` reach Playwright unrounded. Drop maths that floors a pixel offset into a cell (timeline day columns, tree row halves) flips to the neighbouring cell when a hand-computed position lands exactly on the boundary — pass an explicit `sourcePosition` inside the intended cell instead of relying on the element's centre. A `pointer-events-none` row (a disabled tree node) can never be the hit target: drop onto the element the browser actually hit-tests, or Playwright times out waiting for actionability.
