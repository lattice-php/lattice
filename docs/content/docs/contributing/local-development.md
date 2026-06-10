---
title: Local Development
description: Consume Lattice from a local Composer checkout instead of the published packages.
---

When you work on Lattice itself — or need to try an unreleased change in a real application — you consume the package straight from a local checkout rather than from Packagist and npm. The PHP side comes from a Composer path repository, and the React renderer is aliased to the package's source (`resources/js`) instead of installed from npm.

This is the workflow the Testbench app in the repository uses; `workbench/resources/js/app.tsx` and `workbench/resources/css/app.css` are the canonical, working reference.

## Point Composer at your checkout

In the consuming app's `composer.json`, add a path repository and require the dev version:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../lattice-package",
      "options": { "symlink": true }
    }
  ],
  "require": {
    "lattice-php/lattice": "*@dev"
  }
}
```

```bash
composer update lattice-php/lattice
```

Composer symlinks your checkout into `vendor/lattice-php/lattice`, so PHP changes are picked up immediately.

## Install the renderer's JavaScript dependencies

The published npm package declares these for you, but when you consume the source through an alias your app's `node_modules` must provide them itself:

```bash
npm install @inertiajs/react react react-dom \
  lucide-react class-variance-authority clsx tailwind-merge \
  @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-slot \
  @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-details @tiptap/extension-highlight @tiptap/extension-link \
  @tiptap/extension-table @tiptap/extension-text-align
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

## Alias the renderer source

Point `@lattice/lattice` at the symlinked source in your Vite config:

```ts
// vite.config.ts
resolve: {
  alias: {
    "@lattice/lattice": path.resolve(
      __dirname,
      "vendor/lattice-php/lattice/resources/js",
    ),
  },
},
```

Mirror it in `tsconfig.json` so your editor and `tsc` resolve the same imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@lattice/lattice": ["./vendor/lattice-php/lattice/resources/js/index.ts"],
      "@lattice/lattice/*": ["./vendor/lattice-php/lattice/resources/js/*"]
    }
  }
}
```

## Import the stylesheet and register the renderer

Import the stylesheet from the source and register the page component exactly as in [Installation](/introduction/installation/), but resolve everything through the alias:

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "../../vendor/lattice-php/lattice/resources/css/lattice.css";
```

```tsx
import LatticePage from "@lattice/lattice/page";
```

Since your bundler compiles the package's TypeScript directly, edits to `resources/js` in your checkout are reflected on the next Vite reload.
</content>
