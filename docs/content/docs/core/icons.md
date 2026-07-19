---
title: Icons
description: How Lattice renders icons from an SVG sprite, how to add your own, and how to keep icon names type-safe.
---

Lattice renders icons from a single **SVG sprite** built at your app's Vite step. Components reference
an icon by **name** (a string that comes from the server), and the sprite resolves it at render time —
so adding an icon is just dropping an SVG in a folder, with no per-icon imports.

The sprite is produced by Lattice's Vite helper, which wraps
[`@lattice-php/vite-svg-sprite`](https://github.com/lattice-php/vite-svg-sprite) and merges Lattice's
built-in icons with your own into one cached file.

## Setup

Add Lattice's helper to `vite.config.ts`. The helper includes Lattice's icons automatically. Later
directories win on name collisions, so `resources/icons` can override a built-in icon.

```ts
import { lattice } from "@lattice-php/lattice/vite";

export default defineConfig({
  plugins: [
    lattice({
      icons: {
        dirs: ["resources/icons"],
      },
    }),
    laravel({
      /* ... */
    }),
    // ...
  ],
});
```

Then pass the sprite into Lattice's `Provider`:

```tsx
/// <reference types="@lattice-php/lattice/svg-sprite-client" />
import sprite from "virtual:svg-sprite";
import { Provider, registry } from "@lattice-php/lattice";

createInertiaApp({
  setup({ el, App, props }) {
    createRoot(el).render(
      <Provider registry={registry} sprite={sprite}>
        <App {...props} />
      </Provider>,
    );
  },
});
```

In production the sprite is emitted as a hashed asset and referenced with `<use href>`; in dev it's
inlined into the page, so it works regardless of where the page is served from.

## Adding icons

Drop any SVG into a folder the plugin scans (e.g. `resources/icons/spark.svg`) and reference it by its
filename:

```php
MenuItem::make('Spark')->icon('spark');
```

Icons inherit their colour via `currentColor` and their size via the `size-*` utility on the element,
so a single SVG adapts to wherever it's used. To pull icons from a package instead of downloading them
by hand, [vendor them](#vendoring-icons-from-a-package).

## Vendoring icons from a package

Rather than hand-download SVGs, you can **vendor** a named set from an icon package: the plugin copies
just the icons you list into your project and commits them. You ship only the icons you use — not a
whole library — and the set is reproducible from the config. This is how Lattice sources its own icons
from [`lucide-static`](https://www.npmjs.com/package/lucide-static).

Install the source package as a dev dependency:

```bash
npm install -D lucide-static
```

Then list the icons you want under `include`:

```ts
lattice({
  icons: {
    dirs: ["resources/icons"],
    include: [
      {
        from: "lucide-static/icons", // a package's icon folder, or any local directory
        names: ["rocket", "sparkles", "wand-sparkles"],
        outDir: "resources/icons/lucide",
      },
    ],
  },
});
```

Each build copies `rocket.svg`, `sparkles.svg`, and `wand-sparkles.svg` out of the package into
`resources/icons/lucide` and folds them into the sprite. Reference them by name like any other icon:

```php
MenuItem::make('Launch')->icon('rocket');
```

- **`from`** — a folder of SVGs: a package's icon directory resolved from `node_modules`
  (e.g. `lucide-static/icons`), or a path to a local directory.
- **`names`** — the filenames to copy, without `.svg`. A name missing from the source **fails the
  build**, so a typo surfaces immediately.
- **`outDir`** — where the SVGs are written. It joins the sprite automatically; you don't also list it
  under `dirs`.

The copy is **idempotent**: it writes only files whose content changed, so re-running the build is a
no-op once synced, and it never touches anything else in the folder — vendored and hand-authored icons
can share a directory. Commit the copied SVGs; the source package is then only needed at build time, so
anyone installing _your_ package gets the icons without it.

:::note
Dropping an icon from `names` leaves its committed SVG in place — vendoring never deletes files. Remove
the stale SVG by hand when you no longer want it in the sprite.
:::

## Referencing icons

Anywhere a component takes an icon you can pass a plain string or a backed enum:

```php
use Lattice\Lattice\Ui\Enums\Icon;

// by name
Action::make('app.send')->icon('send');

// or via the curated enum of Lattice's built-in icons
Action::make('app.send')->icon(Icon::Send);
```

`Lattice\Lattice\Ui\Enums\Icon` covers Lattice's own icon set. For your full set (Lattice's plus your
own), generate an enum — see below.

## As a component

`Icon` is also a component, so a standalone icon can go anywhere in a schema. It renders through the
same renderer as `->icon()`, with structured `size`/`color` plus a raw `class` escape hatch:

```php
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Ui\Components\Icon;
use Lattice\Lattice\Ui\Enums\Size;

Stack::make()->schema([
    Icon::make('house'),                                       // size defaults to Md
    Icon::make('circle-check')->size(Size::Lg)->color(Color::success()),
    Icon::make('spark')->class('opacity-70'),
]);
```

`size` defaults to `Size::Md`; `color` is optional and inherits `currentColor` when unset. Sizes resolve
to themeable tokens (`--lt-icon-xs` … `--lt-icon-xl`).

## Type-safe icon names

The plugin can generate a type module and/or a PHP enum from the built sprite, so icon names stay
autocompletable. Both files are committed and regenerated idempotently on each build.

**TypeScript** — Lattice emits `resources/js/types/sprite-icons.ts` by default. Override `dts` when you
want a different generated file:

```ts
lattice({
  icons: {
    dirs: ["resources/icons"],
    dts: {
      file: "resources/js/sprite-icons.ts",
      augmentModule: "@lattice-php/lattice",
      augmentInterface: "KnownIcons",
    },
  },
});
```

`dts` merges over the defaults, so a partial override like `dts: { indent: "\t" }` keeps the
default file/augment targets and only changes the indentation used in the generated file — handy
for matching your formatter's style. If the formatter still fights with the generated output, add
`resources/js/types/sprite-icons.ts` to its ignore list; it's a generated file and shouldn't be
rewritten.

**PHP** — `phpEnum` emits a backed enum covering your full sprite:

```ts
lattice({
  icons: {
    dirs: ["resources/icons"],
    phpEnum: { file: "app/Support/Icon.php", namespace: "App\\Support", enum: "Icon" },
  },
});
```

```php
use App\Support\Icon;

MenuItem::make('Home')->icon(Icon::House);
```

Re-run the build (or dev server) after adding icons to refresh the generated files.

## Custom rendering

Server-driven icons resolve through a stack of renderer functions, so you can override how a name
renders — for example to pull from an icon-component library — by wrapping part of the tree in
`IconRendererProvider`:

```tsx
import { IconRendererProvider } from "@lattice-php/lattice";

<IconRendererProvider renderer={({ icon, className }) => /* a node, or null to fall through */}>
  <App />
</IconRendererProvider>;
```

A renderer that returns `null` falls through to the next one, ending at the sprite. This is rarely
needed — dropping an SVG in a folder is the usual path.
