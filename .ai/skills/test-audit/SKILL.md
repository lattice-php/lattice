---
name: test-audit
description: Use when auditing or cleaning up the Lattice test suites (Pest or Vitest) — duplicated or misplaced test helpers, low-value or obsolete tests, tests owned by another package or library, jsdom tests fighting the environment, suite-wide config drift — or when asked to "get rid of useless tests", align testing across packages, or consolidate test infrastructure.
---

# Test Suite Audit & Cleanup

## Overview

A test suite audit removes tests that assert nothing real, moves helpers to the layer that owns them, and converts
environment-fighting tests to the runner that can exercise them honestly. The quality bar for individual tests is
defined in the Testing guideline (`.ai/guidelines/testing.md`) — this skill is the *process* for applying it at suite
scale, for both PHP (Pest) and TypeScript (Vitest).

The outcome of a full run in 2026-08 (PR #405): −145 low-value tests (−2,920 lines), all shared helpers relocated to
their owning packages, and the Vitest browser suite grown 13 → 49 tests on real input — with zero behavioral coverage
lost and every gate green.

## When to use

- The suites have accumulated render-only, class-pinning, `assertDontSee`, or copy-paste tests.
- Test helpers are duplicated across packages, or leaf packages import helpers from a higher layer.
- jsdom tests stub layout APIs, patch prototypes, or hand-invoke mocked callbacks to fake browser behavior.
- Per-package test configs have drifted, or it is unclear which config CI actually runs.

Not for writing individual new tests — the Testing guideline covers that bar directly.

## Workflow

1. **Isolate.** Create a worktree from latest `main` (use the `worktrees` skill). Never audit on a shared dirty
   checkout.

2. **Map the infrastructure before reading any test.**
   - Which configs actually run in CI? (`.github/workflows/` is the truth — locally-runnable configs that CI never
     executes are drift factories and delete candidates.)
   - Inventory helper modules and setup files; diff near-duplicates.
   - Map package ownership before judging coverage. Reusable behavior belongs in the lowest Lattice
     package that owns it; behavior owned by an external dependency belongs in that upstream suite.
     Cross-package integration and Lattice-specific configuration remain locally owned.
   - Trace helper imports across packages. An upward import (leaf package pulling framework test sources) or a
     sideways copy-paste is a relocation finding.
   - Grep for inline duplication clusters: fetch/XHR stubs, router and Inertia mocks, `matchMedia`/`ResizeObserver`
     stubs, provider render wrappers, response builders, node/fixture factories. Count occurrences; 2+ definitions of
     the same concept is a consolidation finding.
   - PHP equivalents: TestCase hierarchy, `Pest.php` hooks, shared factories and datasets, leftover per-suite helpers.

3. **Audit the tests.** Read every test file — grep alone misses most findings. At scale, fan out one read-only
   subagent per package; require each finding as `file:line` + test name + one-line justification + a verdict:
   - **DELETE** — fails the Testing guideline's bar (render-only, styling pin, absence-only, tautology, obsolete pin,
     duplicate).
   - **TRIM** — the test is sound but carries dead assertions (class pins, redundant absence checks) or duplicates a
     sibling; also collapse N near-identical tests into one `it.each`/dataset.
   - **MOVE** — the subject or reusable behavior belongs in another package or external library.
     Name the owning package and its exact surviving or required test.
   - **CONVERT** — the test fights its environment: jsdom → Vitest browser project, or a Pest feature test asserting
     UI → Pest browser test.
   Also collect **exemplars** — the suite's best tests define the house style the survivors should match.

4. **Verify before deleting — the iron rule.** A test dies only when its behavior is worthless *or* has exactly one
   surviving owner, named in the verdict. If behavior lacks coverage in its owning package or library, add the test
   there before deleting the misplaced test; never retain a consumer or aggregate-package test as a substitute. A
   CONVERT deletes the original only after its replacement passes. Never batch-delete on category alone; the audit
   lists are hypotheses until checked against the surviving suite.

5. **Apply in ordered commits.** Order matters:
   1. *Config consolidation first* — otherwise you centralize helpers into N drifting places again.
   2. *Helper moves* — create the owned modules, update every import (no compat re-export shims), delete the copies.
   3. *Deletions/trims* — disjoint packages parallelize safely across subagents.
   4. *Conversions* — the slowest, most careful work.

6. **Gate every stage.** `npm run check` and `composer check` after each commit-sized step; browser suites
   (`npm run test:browser`, `composer test:browser`) whenever rendered behavior moved. Run the Vitest browser suite
   once from a cold cache (`rm -rf node_modules/.vite`) before shipping — CI always runs cold. Rebuild
   (`npm run build`) before Pest browser tests; they serve the last built bundle.

## Verdict cheat-sheet

| Smell | Verdict | Example from the 2026-08 run |
|---|---|---|
| `toHaveClass` mirrors the component's class string | DELETE | separator/skeleton/topbar test files |
| `not.toHaveClass("x")` where `x` no longer exists in the repo | DELETE | `rounded-lt-md` pins |
| Mock configured, then asserted | DELETE | `getActionEffects` mock-in-mock-out |
| Same behavior asserted in N consumers | DELETE N−1, name the owner | visible-condition tests in 10 field files |
| Sound test + dead class/absence assertions | TRIM | sidebar `md:*` mirrors next to `data-collapsed` |
| N clones differing by one value | TRIM to `it.each`/dataset | invalid-date matrices, effect-bridge tests |
| Framework test whose subject is a ui/form component | MOVE (often DELETE: already covered there) | menu-item-action vs button-action |
| Consumer test re-proving another package or library's reusable contract | MOVE; add or identify owning coverage, then DELETE here | framework test for a leaf-package contract |
| Stubbed `getBoundingClientRect`/`matchMedia`, prototype patches, hand-invoked drag callbacks | CONVERT to browser | tree-move, file-upload, table resize |
| Fake timers around debounce feeding real UI | CONVERT (poll real timing) | precognitive typing test |

## Traps

- **Helper semantics differ subtly.** A render wrapper using RTL's `wrapper` option keeps its provider across
  `rerender`; wrapping the element directly does not. When unifying duplicates, adopt the superset semantics and run
  every consumer.
- **Synthetic events hide harness bugs.** Converting `dispatchEvent` to real input regularly *fails first* — missing
  `position: relative`, zero-height elements Playwright refuses to hit, focus that never arrived. That failure is
  signal, not friction: fix the harness, don't fall back to synthetic events.
- **Agents recreate deleted patterns from "sibling convention".** After a purge, an unguided agent asked to test a
  presentational component will rebuild the exact class-pinning file you deleted. The Testing guideline is the
  counterweight — point implementation subagents at it explicitly.
- **Consumer tests become a substitute package suite.** Do not add or keep a test in framework,
  workbench, docs, or another consumer because owning coverage is missing. Put reusable behavior in
  the lowest owning package; keep only cross-package integration and local configuration coverage
  at the consumer boundary.
- **Browser failure artifacts** (`__screenshots__/`, `.vitest-attachments/`) appear on red runs — keep them
  gitignored and out of commits (`git add -A` after a red browser run is how they sneak in).
- **A test that only passes because the environment is fake** (all-zero rects making any pixel number "correct",
  scroll positions jsdom never changes) is not coverage — treat as CONVERT or DELETE even though it is green.
- **PHP browser suite pollution**: the Pest browser suite writes translation stubs (e.g.
  `lang/en/signature-example.php`) via `saveMissing`; remove them before full runs and never commit them.
