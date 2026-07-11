---
title: Installation
description: Install the Lattice Composer package and wire its React renderer into a Laravel + Inertia application.
---

Lattice adds a server-driven UI layer to a Laravel application running [Inertia](https://inertiajs.com/) with the React adapter. Installing it has two halves: the Composer package on the backend and the React renderer on the frontend.

## Requirements

| Requirement               | Version       |
| ------------------------- | ------------- |
| PHP                       | 8.4+          |
| Laravel                   | 11, 12, or 13 |
| Inertia (Laravel + React) | v3            |
| React                     | 19            |
| Tailwind CSS              | 4             |

## How Lattice is delivered

Lattice ships as two coordinated packages:

- **`lattice-php/lattice`** on Composer — the PHP layer that describes pages, forms, tables, actions, and menus and serializes them to typed component trees.
- **`@lattice-php/lattice`** on npm — the React renderer that turns those trees into rendered UI in the browser.

Both packages are cut from the same release, so a given Composer version always has a matching npm version — the renderer can't drift from the server that serialized the page.

## Backend: install the package

```bash
composer require lattice-php/lattice
```

The service provider is registered automatically through Laravel package discovery, so there is nothing to add to `bootstrap/providers.php`.

Publish `config/lattice.php` to customize discovery paths, endpoints, and middleware:

```bash
php artisan vendor:publish --tag="lattice-config"
```

See [Configuration](/introduction/configuration/) for what each option controls.

## Frontend: wire in the renderer

The browser needs the Lattice React renderer to turn the server's component trees into rendered UI. Install it, import its stylesheet, and register the page component.

### Install the package

```bash
npm install @lattice-php/lattice
```

The renderer's UI libraries (Radix, TipTap, i18n, and styling utilities) come with it. `react`, `react-dom`, and `@inertiajs/react` are required peer dependencies you already have in a Laravel React app; `@laravel/echo-react` and `pusher-js` are optional peers, needed only if you use Lattice's [realtime](/core/realtime/) layer. Styling is driven by Tailwind CSS v4:

```bash
npm install -D tailwindcss @tailwindcss/vite tw-animate-css
```

:::note
Lattice targets React 19, Inertia v3, Tailwind 4, and TipTap 3. The npm package version always matches the `lattice-php/lattice` Composer version you installed — they ship from the same release.
:::

### Version compatibility

Keep the Composer and npm package lines aligned. For pre-1.0 releases, install the same `0.x` minor line on both sides, e.g. `lattice-php/lattice:^0.7` with `@lattice-php/lattice@^0.7`. From 1.0 onward, keep the major versions matched, such as `1.x` with `1.x` or `2.x` with `2.x`.

The split is intentional: React, React DOM, and Inertia stay as peer dependencies so the application owns its SPA runtime, while Lattice bundles its renderer internals.

### Configure Vite

Add the Lattice helper to your Vite plugins. It registers the SVG sprite used by Lattice icons, includes Lattice's built-in icons, scans any app icon directories you pass, and generates the TypeScript icon-name module Lattice uses for autocomplete:

```ts
// vite.config.ts
import inertia from "@inertiajs/vite";
import { lattice } from "@lattice-php/lattice/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    lattice({
      icons: {
        dirs: ["resources/icons"],
      },
    }),
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: true,
    }),
    inertia(),
    react(),
    tailwindcss(),
  ],
});
```

`icons.dirs` is optional. Use it when your app has custom SVGs in `resources/icons`. The helper emits `resources/js/types/sprite-icons.ts` by default so icon names stay typed on the React side.

To also generate a PHP enum for your full app sprite, add `phpEnum`:

```ts
lattice({
  icons: {
    dirs: ["resources/icons"],
    phpEnum: {
      file: "app/Support/Icon.php",
      namespace: "App\\Support",
      enum: "Icon",
    },
  },
});
```

### Import the stylesheet

Import Lattice's stylesheet from your main CSS entry, after Tailwind. It defines the theme tokens the components use and registers the package's compiled output with Tailwind automatically, so no extra `@source` line is needed:

```css
/* resources/css/app.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@lattice-php/lattice/css";
```

The component tokens (`--lt-*`) fall back to sensible defaults, so the UI is styled out of the box. They also read from shadcn-style variables (`--background`, `--primary`, …) when you define them, which lets Lattice inherit an existing theme.

### Register the Inertia renderer

Every Lattice route resolves to the same Inertia page component, `lattice/page`, which the package provides. The quickest setup is `createLatticeApp`, a one-call helper that wires the Lattice page and layout resolvers, the `Provider` (registry, sprite, and flash toasts), and theme initialization in one go:

```tsx
// resources/js/app.tsx
/// <reference types="@lattice-php/lattice/svg-sprite-client" />
/// <reference types="@lattice-php/lattice/vite-client" />
import "../css/app.css";
import { createLatticeApp } from "@lattice-php/lattice";
import plugins from "virtual:lattice/plugins";
import sprite from "virtual:svg-sprite";

createLatticeApp({
  plugins,
  sprite,
  pages: import.meta.glob("./Pages/**/*.tsx"),
});
```

It forwards any other `createInertiaApp` option — `title`, `progress`, SSR setup — and accepts a custom `registry` and a `defaultLayout`. Three hooks cover the app-specific bootstrap without falling back to manual wiring: `i18n` configures the [translation frontend](/core/i18n/#wire-the-frontend) from the shared page props (on by default; pass namespaces, or `false` to opt out), `boot` runs before the first render with the initial page (e.g. `configureEcho` from a shared connection prop — a returned promise delays that render), and `wrap` composes your own providers around the app inside the Lattice `Provider`.

Once you scaffold your own fields, components, or columns (see [Custom fields](/extending/custom-fields/)), they are registered in `resources/js/registry.ts`. Pass that file's exported `registry` here so `createLatticeApp` renders them — `createLatticeApp({ registry, plugins, sprite, pages })`. Omit it and your custom types have no renderer, so their nodes render a muted missing-component placeholder instead (and log a `[lattice]` warning in development).

`plugins` registers the renderers of any [component packages](/extending/component-packages/) you install via Composer. The `virtual:lattice/plugins` module is provided by the `lattice()` Vite plugin and resolves to an empty list until you install one, so it is safe to keep here from the start.

#### Manual wiring

If you need full control of the Inertia bootstrap, wire the pieces yourself: use Lattice's page resolver, import the sprite Vite exposes, and wrap the app in `Provider`:

```tsx
// resources/js/app.tsx
/// <reference types="@lattice-php/lattice/svg-sprite-client" />
/// <reference types="@lattice-php/lattice/vite-client" />
import "../css/app.css";
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { createPageResolver, extendRegistry, Provider, registry } from "@lattice-php/lattice";
import { createRoot } from "react-dom/client";
import plugins from "virtual:lattice/plugins";
import sprite from "virtual:svg-sprite";

const pages = import.meta.glob<ResolvedComponent>("./Pages/**/*.tsx");
const resolve = createPageResolver(pages);
const appRegistry = extendRegistry(registry, ...plugins);

createInertiaApp({
  resolve,
  setup({ el, App, props }) {
    if (el) {
      createRoot(el).render(
        <Provider registry={appRegistry} sprite={sprite}>
          <App {...props} />
        </Provider>,
      );
    }
  },
});
```

Keep your existing Inertia options such as `title`, `progress`, layouts, and SSR setup. The important pieces are `createPageResolver(...)` and the single `Provider` around the app. `extendRegistry(registry, ...plugins)` folds in any installed [component packages](/extending/component-packages/); drop it if you don't use them.

### Customizing the registry

The renderer resolves component types from a registry. Lattice exports the pieces you need to extend or replace it:

```ts
import { Provider, Renderer, registry, createRegistry, extendRegistry } from "@lattice-php/lattice";
```

Pass a custom registry to the same `Provider` when you register your own component types, or use `extendRegistry` to add to the defaults. The heaviest built-ins — the rich editor, charts, the date picker — are code-split behind `React.lazy`, so their weight only loads when a page actually renders them.

## Next steps

- [Getting Started](/introduction/getting-started/) — build and route your first page.
- [Configuration](/introduction/configuration/) — discovery, endpoints, and middleware.

:::note
Working on Lattice itself, or against an unreleased change? See [Local Development](/contributing/local-development/) for consuming the package directly from a Composer path checkout instead of npm.
:::
