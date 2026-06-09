---
title: Frontend Setup
description: Wire the Lattice React renderer into your Inertia entrypoint.
---

Lattice serializes pages to typed component trees on the server. The browser needs the Lattice React renderer to turn those trees into rendered UI. This page wires it into your Inertia application once.

## Install JavaScript dependencies

Lattice's renderer is built on Inertia's React adapter and React 19:

```bash
npm install @inertiajs/react react react-dom
```

## Register the renderer

Every Lattice route resolves to the same Inertia page component, `lattice/page`, which the package provides. In your Inertia entrypoint, resolve that name to Lattice's page component and fall back to your own pages for anything else:

```tsx
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@bambamboole/lattice/page";

createInertiaApp({
  resolve: (name) => {
    if (name === "lattice/page") {
      return { default: LatticePage };
    }

    const pages = import.meta.glob("./Pages/**/*.tsx", { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (el) {
      createRoot(el).render(<App {...props} />);
    }
  },
});
```

That single `resolve` branch is all an application needs for every page Lattice routes.

## Customizing the registry

The renderer resolves component types from a registry. Lattice exports the pieces you need to extend or replace it:

```ts
import { Provider, Renderer, registry, createRegistry, extendRegistry } from "@bambamboole/lattice";
```

Wrap your tree in `Provider` with a custom registry to register your own component types, or use `extendRegistry` to add to the defaults. Building custom components is covered in the Advanced section.

:::note
The package's React source lives in the repository's `resources/js` directory, and the Testbench `workbench/resources/js/app.tsx` is the canonical, working reference for the wiring shown above.
:::
