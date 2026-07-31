---
title: Server-side rendering
description: Render Lattice pages to HTML on the server with Inertia SSR and hydrate them in place on the client.
---

Lattice works with [Inertia SSR](https://inertiajs.com/server-side-rendering): the first visit is
rendered to full HTML on the server and the client hydrates it in place. Same pages, same
components — SSR is a deployment choice, not a different way of building.

## The SSR entry

`@inertiajs/vite` normally generates the SSR bootstrap by detecting a literal `createInertiaApp`
call — which a Lattice app doesn't have. The package ships the equivalent for `createLatticeApp`:
**`createLatticeSsr`**, on its own `@lattice-php/lattice/ssr` subpath. Create `resources/js/ssr.tsx`
next to your `app.tsx` and pass it the **same options**:

```tsx
// resources/js/ssr.tsx
import createServer from "@inertiajs/react/server";
import { createLatticeSsr } from "@lattice-php/lattice/ssr";
import plugins from "virtual:lattice/plugins";
import sprite from "virtual:svg-sprite";

createServer(
  createLatticeSsr({
    plugins,
    sprite,
    pages: import.meta.glob("./Pages/**/*.tsx"),
  }),
);
```

`@inertiajs/vite` finds `resources/js/ssr.tsx` on its own and rewrites the `createServer` call into
the development endpoint and the production HTTP bootstrap — one file covers both. Keep the options
in sync with [`createLatticeApp`](/introduction/installation/#register-the-inertia-renderer) (or
extract them into a shared module); browser-only options such as `boot` never run on the server, so
sharing one options object is safe.

:::note
`createLatticeSsr` lives on its own subpath on purpose: it imports `react-dom/server`, which has no
business in a client bundle. Import it only from the SSR entry, never from `app.tsx`.
:::

## Development

Nothing else to start. With the entry in place and `inertia.ssr.enabled` on (the default), the
Laravel adapter renders through the Vite dev server directly — no separate Node process.

## Production

Build the SSR bundle alongside the client build and run the SSR server. With the Laravel Vite
plugin, point its `ssr` option at the same entry so `vite build --ssr` emits
`bootstrap/ssr/ssr.mjs` where the adapter expects it:

```ts
// vite.config.ts
laravel({
  input: ["resources/css/app.css", "resources/js/app.tsx"],
  ssr: "resources/js/ssr.tsx",
}),
```

```bash
vite build && vite build --ssr
php artisan inertia:start-ssr
```

## What the server renders

- The full page — layout, navigation, and every eagerly registered component. Components registered
  with `lazyComponent()` render their loading fallback on the server and stream in after hydration;
  register a component with `eagerComponent()` if its markup should be part of the server HTML.
- The theme. Lattice shares the `appearance` cookie with the server render, so a user who picked
  dark mode gets dark-mode HTML instead of a flash of the default.
- `boot` and the rest of the client bootstrap run after hydration. On a server-rendered page the
  first client render intentionally does not wait for them — hydration must match the HTML the
  server produced.

## SSR-safe custom components

Anything you register yourself ([custom fields](/extending/custom-fields/),
[component packages](/extending/component-packages/)) renders on the server too. Two rules keep a
component SSR-safe:

- Don't touch `window`, `document`, or other browser globals during render — move that work into an
  effect, or guard it with `typeof window === "undefined"`.
- Import `useLayoutEffect` from `@lattice-php/lattice/lib/use-layout-effect` instead of `react`.
  It is the same hook in the browser and substitutes `useEffect` on the server, where React's own
  `useLayoutEffect` warns.
