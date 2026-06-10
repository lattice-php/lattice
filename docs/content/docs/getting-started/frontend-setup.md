---
title: Frontend Setup
description: Wire the Lattice React renderer into your Inertia entrypoint.
---

Lattice serializes pages to typed component trees on the server. The browser needs the Lattice React renderer — published as `@lattice-php/lattice` — to turn those trees into rendered UI. This page wires it in once.

There are three steps: install the package, import its stylesheet, and register the page component.

## Install the package

```bash
npm install @lattice-php/lattice
```

The renderer's UI libraries (Radix, TipTap, Lucide, …) come with it. `react`, `react-dom`, and `@inertiajs/react` are peer dependencies you already have in a Laravel React app. Styling is driven by Tailwind CSS v4:

```bash
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

:::note
Lattice targets React 19, Inertia v3, Tailwind 4, and TipTap 3. The npm package version always matches the `lattice-php/lattice` Composer version you installed — they ship from the same release.
:::

## Import the stylesheet

Import Lattice's stylesheet from your main CSS entry, after Tailwind. It defines the theme tokens the components use and registers the package's compiled output with Tailwind automatically, so no extra `@source` line is needed:

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@lattice-php/lattice/css";
```

The component tokens (`--lt-*`) fall back to sensible defaults, so the UI is styled out of the box. They also read from shadcn-style variables (`--background`, `--primary`, …) when you define them, which lets Lattice inherit an existing theme.

## Register the renderer

Every Lattice route resolves to the same Inertia page component, `lattice/page`, which the package provides. In your Inertia entrypoint, resolve that name to Lattice's page component and fall back to your own pages for anything else:

```tsx
// resources/js/app.tsx
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice-php/lattice/page";

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
import { Provider, Renderer, registry, createRegistry, extendRegistry } from "@lattice-php/lattice";
```

Wrap your tree in `Provider` with a custom registry to register your own component types, or use `extendRegistry` to add to the defaults. Heavy built-ins (forms, tables, the rich editor) are registered lazily and code-split, so you only ship what a page actually renders. Building custom components is covered in the Advanced section.

:::note
Working on Lattice itself, or against an unreleased change? See [Local Development](/contributing/local-development/) for consuming the package directly from a Composer path checkout instead of npm.
:::
</content>
