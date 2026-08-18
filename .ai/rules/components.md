---
paths:
  - 'packages/ui/resources/js/components/**'
---

# Components

## One folder per node type: client component + adapter
Every wire node type lives in components/<name>/: <name>.tsx is the props-based client component (exported via index.ts and importable as @lattice-php/ui/components/<name>/<name>), <name>-adapter.tsx is the wire adapter (default export, registered in plugin.ts). Keep adapters explicit prop-by-prop — no generic {...node.props} spread; the explicit mapping is what catches wire/client drift and stops unknown wire props leaking into the DOM. Adapters set data-lattice-component={nodeIdentity(node)} on the component root and data-test on interactive trigger elements (e.g. `${identity}-trigger`). Adapter tests (<name>-adapter.test.tsx) cover only the wire→prop mapping; client behavior belongs in <name>.test.tsx. Some folders are adapter-only because the client primitive already exists elsewhere (link→text-link.tsx, icon→icons/, modal→dialog.tsx, image→image-preview.tsx).
