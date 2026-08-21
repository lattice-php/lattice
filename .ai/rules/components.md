---
paths:
  - 'packages/ui/resources/js/components/**'
---

# Components

## One folder per node type: client component + adapter
Every wire node type lives in components/<name>/: <name>.tsx is the props-based client component (exported via index.ts and importable as @lattice-php/ui/components/<name>/<name>), <name>-adapter.tsx is the wire adapter (default export, registered in plugin.ts). Keep adapters explicit prop-by-prop — no generic {...node.props} spread; the explicit mapping is what catches wire/client drift and stops unknown wire props leaking into the DOM. Adapters set data-lattice-component={nodeIdentity(node)} on the component root and data-test on interactive trigger elements (e.g. `${identity}-trigger`); when the client's root is a portal or trigger, pass them through a triggerProps/spreadable prop (tooltip, floating-panel). Adapter tests (<name>-adapter.test.tsx) cover only the wire→prop mapping; client behavior belongs in <name>.test.tsx. Some folders are adapter-only because the client lives in primitives/ or has nothing reusable (link→primitives/text-link.tsx, icon→icons/, modal→primitives/dialog.tsx, raw-block renders inline HTML). Closely related node types may share one folder with named *Adapter exports (tabs, sidebar, the entry.* adapters in entries/). Heavy clients split in two: <name>.tsx is the public client that owns Suspense and lazy-loads <name>-view.tsx as a separate chunk (code-block, chart) — never lazy-load from the adapter.
