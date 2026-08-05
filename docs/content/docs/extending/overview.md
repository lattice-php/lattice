---
title: Extending Lattice
description: Add custom components, form fields, and table columns to a Lattice application.
---

Lattice ships with a built-in set of components, fields, and columns. When your application needs something the built-ins do not cover, you extend the registry with your own types.

## The mental model

Every client extension in Lattice carries a `type` string. The PHP class declares it once via an
attribute, and the client uses that type to find the matching implementation. Use `#[AsField]` for
form fields, `#[AsComponent]` for regular UI components, and `#[AsColumn]` for table columns.

```php
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Field;

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

| Kind         | PHP base class                    | Registry                      |
| ------------ | --------------------------------- | ----------------------------- |
| Form field   | `Lattice\Form\Components\Field`   | `components`                  |
| UI component | `Lattice\Ui\Components\Component` | `components`                  |
| Table column | `Lattice\Table\Columns\Column`    | `extensions["table.columns"]` |

All three register in one plugin object. Form fields and UI components are complete nodes, so the core
renderer resolves them through `components`. A table column only contributes a cell renderer to the
table feature, so it goes in `extensions["table.columns"]`.

## Generators scaffold both sides

The `lattice:field`, `lattice:component`, and `lattice:column` commands generate the PHP class, the `.tsx` renderer (under `resources/js/fields/`, `components/`, or `columns/`), and append the registration entry to `resources/js/registry.ts` — so you get a working pair to build on:

```bash
php artisan lattice:field ColorPicker
php artisan lattice:component Rating
php artisan lattice:column StatusBadge
```

Each command accepts `--type=` to override the derived type string.

See [Artisan commands](/core/artisan-commands/) for the full CLI reference.

## Type generation

After adding custom props to a PHP class, run:

```bash
php artisan lattice:typescript
```

This scans the paths listed in `config/lattice.php` under `discover`, reads public properties, and writes `resources/js/lattice/generated.d.ts`. That file augments `ComponentProps` (for fields and components) and `ColumnProps` (for columns) in the `@lattice-php/core` module, giving you typed `node.props` and `column.props` in the renderer.

Without running `lattice:typescript` the props fall back to a loose `Record<string, unknown>` — the renderer still works, types are just not narrowed.

## Where to go next

- [Custom fields](/extending/custom-fields/) — end-to-end walkthrough for a `ColorPicker` form field.
- [Custom columns](/extending/custom-columns/) — end-to-end walkthrough for a `StatusBadge` table column.
- [Registry and types](/extending/registry-and-types/) — the full React API and the TypeScript augmentation system.
