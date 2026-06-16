---
title: Extending Lattice
description: Add custom components, form fields, and table columns to a Lattice application.
---

Lattice ships with a built-in set of components, fields, and columns. When your application needs something the built-ins do not cover, you extend the registry with your own types.

## The mental model

Every renderable in Lattice carries a `type` string. The PHP class declares it once via an attribute, and the React renderer looks that type up in a registry to decide which component to render. Use `#[AsField]` for form fields, `#[AsComponent]` for regular UI components, and `#[AsColumn]` for table columns.

```php
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Field;

#[AsField(type: 'color-picker')]
class ColorPickerField extends Field {}
```

On the React side, a matching renderer is registered under the same type key:

```tsx
import type { RendererComponent } from "@lattice-php/lattice";

export const ColorPickerComponent: RendererComponent<"field.color-picker"> = ({ node }) => {
  return <input type="color" name={String(node.props.name ?? "")} />;
};
```

That string — `"field.color-picker"` — is the only coupling between the PHP class and the React component.

## Three extension points

| Kind | PHP base class | Registry |
| --- | --- | --- |
| Form field | `Lattice\Lattice\Forms\Components\Field` | Node registry (`plugin.ts`) |
| UI component | `Lattice\Lattice\Core\Components\Component` | Node registry (`plugin.ts`) |
| Table column | `Lattice\Lattice\Tables\Columns\Column` | Column-cell registry (`columns.ts`) |

Form fields and UI components share the **node registry** — the renderer walks the component tree and resolves each `type` to a `RendererComponent`. Table columns use a separate **column-cell registry** because only the cell needs a custom renderer; the table chrome (header, sorting, filtering) is provided by Lattice.

## Generators scaffold both sides

The `lattice:field`, `lattice:component`, and `lattice:column` commands generate the PHP class, the `.tsx` renderer, and insert the registration entry — so you get a working pair to build on:

```bash
php artisan lattice:field ColorPicker
php artisan lattice:component Rating
php artisan lattice:column StatusBadge
```

Each command accepts `--type=` to override the derived type string.

## Type generation

After adding custom props to a PHP class, run:

```bash
php artisan lattice:typescript
```

This scans the paths listed in `config/lattice.php` under `discover`, reads public properties, and writes `resources/js/lattice/generated.d.ts`. That file augments `ComponentProps` (for fields and components) and `ColumnProps` (for columns) in the `@lattice-php/lattice` module, giving you typed `node.props` and `column.props` in the renderer.

Without running `lattice:typescript` the props fall back to a loose `Record<string, unknown>` — the renderer still works, types are just not narrowed.

## Where to go next

- [Custom fields](/extending/custom-fields/) — end-to-end walkthrough for a `ColorPicker` form field.
- [Custom columns](/extending/custom-columns/) — end-to-end walkthrough for a `StatusBadge` table column.
- [Registry and types](/extending/registry-and-types/) — the full React API and the TypeScript augmentation system.
