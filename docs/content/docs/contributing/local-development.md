---
title: Local Development
description: Consume Lattice from a local Composer checkout instead of the published packages.
---

There are two supported local-development loops:

- **Workbench development** — the default loop for changing Lattice itself.
- **External app source-linking** — an integration loop for testing an unreleased checkout inside a real Laravel app with Vite HMR.

Use package-linking only when you want publish-like verification. It exercises the built `dist` package and therefore requires rebuilding after JavaScript changes.

## Workbench development

The repository ships with an Orchestra Testbench workbench app. This is the default way to develop Lattice because PHP, routes, fixtures, Vite, Tailwind, icons, and the React renderer are already wired together.

Install dependencies once:

```bash
composer install
npm install
```

Serve the workbench:

```bash
composer serve
npm run dev
```

The workbench compiles Lattice directly from `resources/js` and imports the stylesheet directly from `resources/css/lattice.css`, so frontend changes are picked up by Vite without running the package build.

The canonical references are:

- `workbench/resources/js/app.tsx`
- `workbench/resources/css/app.css`
- `vite.config.ts`

## External app source-linking

Use this when you need to try local Lattice changes inside an existing Laravel + Inertia React application. The PHP side is linked with Composer, and the React renderer is compiled from source by the consuming app's Vite dev server.

This mode gives you HMR for Lattice's TypeScript and CSS without running `npm run build:lib`.

### Link PHP with Composer

In the consuming app's `composer.json`, add a path repository and require the dev version:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../lattice",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

```bash
composer require lattice-php/lattice:"*@dev" -W
```

Composer symlinks your checkout into `vendor/lattice-php/lattice`, so PHP changes are picked up by the app immediately.

### Keep the public npm package installed

```bash
npm install @lattice-php/lattice
```

Keep application imports on the public package name:

```tsx
import LatticePage from "@lattice-php/lattice/page";
import { Provider, registry } from "@lattice-php/lattice";
```

Do not import from `@lattice/lattice` in application code. That name is an internal source alias used by the package itself.

### Alias the renderer source

Add an opt-in source alias to the consuming app's `vite.config.ts`:

```ts
import path from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const latticeRoot = path.resolve(__dirname, "vendor/lattice-php/lattice");
const latticeSource = path.resolve(latticeRoot, "resources/js");
const useLocalLattice = process.env.LATTICE_SOURCE === "1";

export default defineConfig({
  resolve: {
    alias: useLocalLattice
      ? {
          "@lattice-php/lattice/css": path.resolve(latticeRoot, "resources/css/lattice.css"),
          "@lattice-php/lattice": latticeSource,
          "@lattice/lattice": latticeSource,
        }
      : {},
    dedupe: ["react", "react-dom", "@inertiajs/react"],
  },
  server: useLocalLattice
    ? {
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd()), latticeRoot],
        },
      }
    : undefined,
});
```

This keeps normal development on the installed npm package, while `LATTICE_SOURCE=1` switches Vite to the checkout under `vendor/lattice-php/lattice`.

If your editor or `tsc` does not follow Vite aliases, mirror the public package name in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@lattice-php/lattice": ["./vendor/lattice-php/lattice/resources/js/index.ts"],
      "@lattice-php/lattice/*": ["./vendor/lattice-php/lattice/resources/js/*"]
    }
  }
}
```

### Scan Lattice source with Tailwind

Keep the regular stylesheet import, then add a Tailwind source path for the linked checkout:

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@lattice-php/lattice/css";

@source "../../vendor/lattice-php/lattice/resources/js";
```

### Run the app in source mode

```bash
LATTICE_SOURCE=1 npm run dev
```

Vite now compiles the linked checkout directly. TypeScript and CSS changes in Lattice update through the consuming app's dev server without a package build.

## Package-link verification

Use package-linking when you want to test the same surface that npm publishes:

```bash
npm install @lattice-php/lattice@file:../lattice
```

This mode reads the package exports and `dist` files. It is closer to a release, but it is not a live source workflow. Run the package build after renderer changes:

```bash
cd ../lattice
npm run build:lib
```

Use source-linking for daily integration work, and package-linking for publish-like checks.
