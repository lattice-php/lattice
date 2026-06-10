---
title: Frontend Setup
description: Wire the Lattice React renderer into your Inertia entrypoint.
---

Lattice serializes pages to typed component trees on the server. The browser needs the Lattice React renderer to turn those trees into rendered UI. The renderer ships as TypeScript source inside the Composer package (`vendor/lattice/lattice/resources/js`), and your own Vite build compiles it. This page wires it in once.

There are four steps: install the JavaScript dependencies, alias the package, import the stylesheet, and register the page component.

## Install JavaScript dependencies

Because Vite compiles the renderer source directly, its libraries must be present in your app's `node_modules`. Install them alongside Inertia's React adapter:

```bash
npm install @inertiajs/react react react-dom \
  lucide-react class-variance-authority clsx tailwind-merge \
  @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-slot \
  @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-details @tiptap/extension-highlight @tiptap/extension-link \
  @tiptap/extension-table @tiptap/extension-text-align
```

Styling is driven by Tailwind CSS v4:

```bash
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

:::note
Lattice targets React 19, Inertia v3, Tailwind 4, and Tiptap 3. If you already started from an Inertia React kit you will have some of these — `npm install` is safe to re-run. The package's `package.json` is the source of truth for the exact versions Lattice is built against.
:::

## Alias the package

Point `@lattice/lattice` at the renderer source in your Vite config. Keep your existing plugins; only the `resolve.alias` block is new:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    laravel({ input: ["resources/css/app.css", "resources/js/app.tsx"], refresh: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@lattice/lattice": path.resolve(
        __dirname,
        "vendor/lattice/lattice/resources/js",
      ),
    },
  },
});
```

Mirror the alias in `tsconfig.json` so your editor and `tsc` resolve the same imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@lattice/lattice": ["./vendor/lattice/lattice/resources/js/index.ts"],
      "@lattice/lattice/*": ["./vendor/lattice/lattice/resources/js/*"]
    }
  }
}
```

## Import the stylesheet

Import Lattice's stylesheet from your main CSS entry, after Tailwind. It defines the theme tokens the components use and registers their source files with Tailwind automatically, so no extra `@source` line is needed:

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "../../vendor/lattice/lattice/resources/css/lattice.css";
```

The component tokens (`--lt-*`) fall back to sensible defaults, so the UI is styled out of the box. They also read from shadcn-style variables (`--background`, `--primary`, …) when you define them, which lets Lattice inherit an existing theme.

## Register the renderer

Every Lattice route resolves to the same Inertia page component, `lattice/page`, which the package provides. In your Inertia entrypoint, resolve that name to Lattice's page component and fall back to your own pages for anything else:

```tsx
// resources/js/app.tsx
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice/lattice/page";

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
import { Provider, Renderer, registry, createRegistry, extendRegistry } from "@lattice/lattice";
```

Wrap your tree in `Provider` with a custom registry to register your own component types, or use `extendRegistry` to add to the defaults. Building custom components is covered in the Advanced section.

:::note
The Testbench app at `workbench/resources/js/app.tsx` and `workbench/resources/css/app.css` in the [repository](https://github.com/lattice-php/lattice) is the canonical, working reference for the wiring shown here. It imports the renderer through a repo-local alias rather than `vendor/`, but the setup is otherwise identical.
:::
</content>
