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
