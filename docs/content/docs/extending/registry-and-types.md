---
title: Registry and types
description: The React registry API and the TypeScript augmentation system for custom Lattice components.
---

## The JS scaffold

Before registering custom components or columns, publish the scaffold file:

```bash
php artisan vendor:publish --tag=lattice-js
```

This writes a single `resources/js/registry.ts`. It calls `createPlugin` with empty `components` and
`columns` blocks and merges it onto the built-in registry with `extendRegistry`, exporting the result
as `registry`:

```ts
import { createPlugin, extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({
    name: "app",
    components: {}, // custom fields and UI components
    columns: {}, // custom column cells
  }),
);
```

The generators (`lattice:field`, `lattice:component`, `lattice:column`) append their entries to this
file automatically — fields and components under `components`, columns under `columns`. You only need
to publish once, and you pass the exported `registry` to `Provider`.

## Node registry API

The node registry maps type strings to `RendererComponent` functions. Imports come from `@lattice-php/lattice`.

### createPlugin

Creates a named plugin object that bundles one or more component registrations:

```ts
import { createPlugin, eagerComponent } from "@lattice-php/lattice";
import { ColorPickerComponent } from "./fields/color-picker";
import { RatingComponent } from "./components/rating";

export const appPlugin = createPlugin({
  name: "app",
  components: {
    "field.color-picker": eagerComponent(ColorPickerComponent),
    rating: eagerComponent(RatingComponent),
  },
});
```

### extendRegistry

Merges a plugin into an existing registry, returning a new registry without mutating the original. The
published `resources/js/registry.ts` already calls it for you — this is the pattern it uses:

```ts
import { createPlugin, extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({ name: "app", components: {}, columns: {} }),
);
```

`packageRegistry` is Lattice's built-in registry. Pass the extended `registry` to `Provider`. Call
`extendRegistry` again yourself only if you keep additional plugins in their own files.

The built-in `registry` is a single flat map of eager components; the few heavy ones (the rich editor,
chart, and date inputs) code-split their dependency from inside the component, so you never choose
between an eager and a lazy variant. See [Bundle size](/advanced/bundle-size/) for the details.

### createRegistry

Creates a registry from scratch (no built-ins). Only use this if you want to replace the entire built-in component set:

```ts
import { createRegistry } from "@lattice-php/lattice";

const minimalRegistry = createRegistry(appPlugin);
```

### eagerComponent / lazyComponent

Components can be registered eagerly (imported at module load time) or lazily (code-split on first render):

```ts
import { createPlugin, eagerComponent, lazyComponent } from "@lattice-php/lattice";
import { RatingComponent } from "./components/rating";

export const appPlugin = createPlugin({
  name: "app",
  components: {
    // Eager — bundled with the entry point.
    rating: eagerComponent(RatingComponent),
    // Lazy — splits into a separate chunk loaded on demand.
    "field.color-picker": lazyComponent(async () => ({
      default: (await import("./fields/color-picker")).ColorPickerComponent,
    })),
  },
});
```

### Provider and the registry

`Provider` supplies the registry to every Lattice component below it in the tree:

```tsx
import { Provider } from "@lattice-php/lattice";

createRoot(el).render(
  <Provider registry={appRegistry}>
    <App {...props} />
  </Provider>,
);
```

A custom renderer receives its already-rendered child nodes as `children`. When you need the active component registry directly, use `useComponentRegistry`:

```ts
import { useComponentRegistry } from "@lattice-php/lattice";

const components = useComponentRegistry();
```

## Column-cell registry API

The column-cell registry maps type strings to `ColumnCellComponent` functions.

### Column plugins

Column cell renderers use the same plugin object as components. They go under the `columns` key of the
same `resources/js/registry.ts` (registered bare — `columnCell()` is optional, see below):

```ts
import { createPlugin, extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({
    name: "app",
    components: {},
    columns: {
      "column.status-badge": StatusBadgeCell,
    },
  }),
);
```

The same exported `registry` carries both your components and your column cells — there is no second
registry to merge.

### useColumnRegistry

Returns the current column registry from inside any component rendered by Lattice:

```ts
import { useColumnRegistry } from "@lattice-php/lattice";

const columnRegistry = useColumnRegistry();
```

## TypeScript augmentation

### The augmentable interfaces

`@lattice-php/lattice` exports one augmentable interface per wire-type family:

- `ComponentProps` — maps a type string to its props shape for fields and UI components.
- `ColumnProps` — maps a type string to its props shape for column cells.
- `FilterProps` — maps a filter control to its props shape.
- `EffectProps` — maps an effect type to its props shape.
- `EditorExtensionProps` — maps a [rich-editor extension](/forms/fields/rich-editor/#custom-extensions) type to its props shape.

All of them use TypeScript's declaration merging. You can augment them manually or let `lattice:typescript` do it.

### php artisan lattice:typescript

Run this command whenever your PHP classes gain or lose public properties. It discovers your
`#[AsComponent]`-marked components, columns and filters, plus `#[AsEffect]` effects and
`#[AsEditorExtension]` rich-editor extensions:

```bash
php artisan lattice:typescript
```

It scans the paths listed under `discover` in `config/lattice.php`:

```php
// config/lattice.php
'discover' => [
    base_path('app'),
],
```

And writes an augmentation file to the path configured under `typescript.output` (default: `resources/js/lattice/generated.d.ts`):

```ts
// This file is generated by `php artisan lattice:typescript`. Do not edit.
declare module "@lattice-php/lattice" {
  interface ComponentProps {
    "field.color-picker": {
      swatches: string | null;
    };
  }
  interface ColumnProps {
    "column.status-badge": {
      colorMap: Record<string, string> | null;
    };
  }
}

export {};
```

Without this file, `node.props` and `column.props` fall back to `Record<string, unknown>`. The renderers still work — types are just not narrowed.

See [Artisan commands](/core/artisan-commands/) for the full command reference.

### Augmenting manually

If you prefer not to run the generator, augment the interfaces directly in any `.d.ts` file included in your `tsconfig.json`:

```ts
import "@lattice-php/lattice";

declare module "@lattice-php/lattice" {
  interface ComponentProps {
    "field.color-picker": {
      swatches: string | null;
    };
  }
}
```

The interface names carry no `Lattice` prefix — `ComponentProps`, `ColumnProps`, `FilterProps`,
`EffectProps`, `EditorExtensionProps`.
