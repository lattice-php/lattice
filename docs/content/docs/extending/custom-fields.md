---
title: Custom fields
description: Scaffold a custom form field with a PHP class and a React renderer.
---

This walkthrough adds a `ColorPicker` field — a native `<input type="color">` — to a Lattice form.

## 1. Publish the JS scaffold

If you have not done this yet, publish the registration file the generators expect:

```bash
php artisan vendor:publish --tag=lattice-js
```

This writes a single `resources/js/registry.ts` if it does not already exist — the one place custom fields, components, and columns are registered.

## 2. Generate the field

```bash
php artisan lattice:field ColorPicker
```

This creates:

- `app/Forms/Fields/ColorPicker.php` — the PHP class.
- `resources/js/fields/color-picker.tsx` — the React renderer stub.
- An entry under `components` in `resources/js/registry.ts` wiring them together.
- Runs `lattice:typescript` to refresh the generated types file.

The PHP attribute receives the short identifier `color-picker`; the wire type is `field.color-picker`.
Pass `--type=` to override it.

## 3. The generated PHP class

```php
<?php

namespace App\Forms\Fields;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Field;

#[AsField(type: 'color-picker')]
class ColorPicker extends Field
{
    //
}
```

`Field` provides the standard field API — `make()`, `required()`, `disabled()`, `value()`, and the rest. Add public properties for any extra data you want available in the renderer:

```php
#[AsField(type: 'color-picker')]
class ColorPicker extends Field
{
    public ?string $swatches = null;

    public function swatches(string $swatches): static
    {
        $this->swatches = $swatches;

        return $this;
    }
}
```

## 4. The generated React renderer

```tsx
import type { RendererComponent } from "@lattice-php/lattice";

export const ColorPickerComponent: RendererComponent<"field.color-picker"> = ({ node }) => {
  // Render the field.color-picker field. Field state is available on node.props.
  return <div data-lattice-field={String(node.props.name ?? "")} />;
};
```

Replace the stub body with real UI:

```tsx
import type { RendererComponent } from "@lattice-php/lattice";

export const ColorPickerComponent: RendererComponent<"field.color-picker"> = ({ node }) => {
  return (
    <input
      type="color"
      name={String(node.props.name ?? "")}
      defaultValue={String(node.props.value ?? "#000000")}
    />
  );
};
```

`node.props` contains all the serialized field data — name, value, label, required, and any extra properties you added to the PHP class.

## 5. The registry entry

The generator appended an entry to `resources/js/registry.ts`, wrapping the renderer in `eagerComponent`:

```ts
import {
  createPlugin,
  eagerComponent,
  extendRegistry,
  registry as packageRegistry,
} from "@lattice-php/lattice";
import { ColorPickerComponent } from "./fields/color-picker";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({
    name: "app",
    components: {
      "field.color-picker": eagerComponent(ColorPickerComponent),
    },
    columns: {},
  }),
);
```

`createPlugin` accepts any number of component type keys. Use `lazyComponent` instead for a code-split renderer — its loader must resolve to a module with a `default` export:

```ts
"field.color-picker": lazyComponent(async () => ({
  default: (await import("./fields/color-picker")).ColorPickerComponent,
})),
```

## 6. Wire the registry in app.tsx

`registry.ts` already merges your plugin onto the built-in registry. Pass its exported `registry` to `createLatticeApp` — the same one-call bootstrap from installation, now made aware of your custom components:

```tsx
import "../css/app.css";
import { createLatticeApp } from "@lattice-php/lattice";
import plugins from "virtual:lattice/plugins";
import sprite from "virtual:svg-sprite";
import { registry } from "./registry";

createLatticeApp({
  registry,
  plugins,
  sprite,
  pages: import.meta.glob("./Pages/**/*.tsx"),
});
```

Passing `registry` is what makes your field render. Without it, `createLatticeApp` falls back to the built-in registry, your custom type has no renderer, and the node renders a muted missing-component placeholder instead of your field (Lattice also logs a `[lattice] No component registered…` warning in development to flag exactly this).

## 7. Generate TypeScript types

```bash
php artisan lattice:typescript
```

This writes `resources/js/lattice/generated.d.ts`, which augments the `ComponentProps` interface in `@lattice-php/lattice`:

```ts
declare module "@lattice-php/lattice" {
  interface ComponentProps {
    "field.color-picker": {
      swatches: string | null;
    };
  }
}
```

After running this command, `node.props.swatches` is typed in your renderer.

## 8. Use the field in a form

```php
use App\Forms\Fields\ColorPicker;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('app.brand-settings')]
final class BrandSettingsForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            ColorPicker::make('brand_color', 'Brand color')
                ->swatches('#ff0000,#00ff00,#0000ff')
                ->value('#6366f1'),
        ]);
    }

    public function handle(Request $request): Response
    {
        $validated = $this->validate($request);

        // persist $validated['brand_color'] …

        return redirect()->back();
    }
}
```

The field serializes to a node with `type: "field.color-picker"` and the renderer picks it up automatically.
