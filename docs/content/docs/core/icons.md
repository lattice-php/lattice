---
title: Icons
description: How Lattice renders icons from an SVG sprite, how to add your own, and how to keep icon names type-safe.
---

Lattice renders icons from a single **SVG sprite** built at your app's Vite step. Components reference
an icon by **name** (a string that comes from the server), and the sprite resolves it at render time —
so adding an icon is just dropping an SVG in a folder, with no per-icon imports.

The sprite is produced by [`@lattice-php/vite-svg-sprite`](https://github.com/lattice-php/vite-svg-sprite),
which merges Lattice's built-in icons with your own into one cached file.

## Setup

Install the plugin:

```sh
npm i -D @lattice-php/vite-svg-sprite
```

Add it to `vite.config.ts`, pointing it at Lattice's icons (shipped in the Composer package) and your
own folder. Later directories win on name collisions, so `resources/icons` can override a built-in icon.

```ts
import { svgSprite } from "@lattice-php/vite-svg-sprite";

export default defineConfig({
  plugins: [
    svgSprite({
      iconDirs: ["vendor/lattice-php/lattice/resources/icons", "resources/icons"],
    }),
    laravel({ /* ... */ }),
    // ...
  ],
});
```

Then pass the sprite into Lattice's `Provider`:

```tsx
/// <reference types="@lattice-php/vite-svg-sprite/client" />
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
so a single SVG adapts to wherever it's used.

## Referencing icons

Anywhere a component takes an icon you can pass a plain string or a backed enum:

```php
use Lattice\Lattice\Core\Enums\Icon;

// by name
Action::make('app.send')->icon('send');

// or via the curated enum of Lattice's built-in icons
Action::make('app.send')->icon(Icon::Send);
```

`Lattice\Lattice\Core\Enums\Icon` covers Lattice's own icon set. For your full set (Lattice's plus your
own), generate an enum — see below.

## As a component

`Icon` is also a component, so a standalone icon can go anywhere in a schema. It renders through the
same renderer as `->icon()`, with structured `size`/`color` plus a raw `class` escape hatch:

```php
use Lattice\Lattice\Core\Components\Icon;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Size;

Stack::make()->schema([
    Icon::make('house'),                                       // size defaults to Md
    Icon::make('circle-check')->size(Size::Lg)->color(Color::Success),
    Icon::make('spark')->class('opacity-70'),
]);
```

`size` defaults to `Size::Md`; `color` is optional and inherits `currentColor` when unset. Sizes resolve
to themeable tokens (`--lt-icon-xs` … `--lt-icon-xl`).

## Type-safe icon names

The plugin can generate a type module and/or a PHP enum from the built sprite, so icon names stay
autocompletable. Both files are committed and regenerated idempotently on each build.

**TypeScript** — `dts` emits an `IconName` union and augments `<Icon name>` so the editor suggests your
icons:

```ts
svgSprite({
  iconDirs: ["vendor/lattice-php/lattice/resources/icons", "resources/icons"],
  dts: {
    file: "resources/js/sprite-icons.ts",
    augmentModule: "@lattice-php/lattice",
    augmentInterface: "KnownIcons",
  },
});
```

**PHP** — `phpEnum` emits a backed enum covering your full sprite:

```ts
svgSprite({
  // ...
  phpEnum: { file: "app/Support/Icon.php", namespace: "App\\Support", enum: "Icon" },
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
