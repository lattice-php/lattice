---
title: Custom fields
description: Scaffold a custom form field with a PHP class and a React renderer.
---

This walkthrough adds a `ColorPicker` field — a native `<input type="color">` — to a Lattice form.

## 1. Publish the JS scaffold

If you have not done this yet, publish the two registration files the generators expect:

```bash
php artisan vendor:publish --tag=lattice-js
```

This writes `resources/js/lattice/plugin.ts` (for fields and components) and `resources/js/lattice/columns.ts` (for columns) if they do not already exist.

## 2. Generate the field

```bash
php artisan lattice:field ColorPicker
```

This creates:

- `app/Forms/Fields/ColorPicker.php` — the PHP class.
- `resources/js/lattice/fields/color-picker.tsx` — the React renderer stub.
- An entry in `resources/js/lattice/plugin.ts` wiring them together.
- Runs `lattice:typescript` to refresh the generated types file.

The derived type string is `form.color-picker`. Pass `--type=` to override it.

## 3. The generated PHP class

```php
<?php

namespace App\Forms\Fields;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Forms\Components\Field;

#[Component('form.color-picker')]
class ColorPicker extends Field
{
    //
}
```

`Field` provides the standard field API — `make()`, `required()`, `disabled()`, `value()`, and the rest. Add public properties for any extra data you want available in the renderer:

```php
#[Component('form.color-picker')]
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

export const ColorPickerComponent: RendererComponent<"form.color-picker"> = ({ node }) => {
  // Render the form.color-picker field. Field state is available on node.props.
  return <div data-lattice-field={String(node.props.name ?? "")} />;
};
```

Replace the stub body with real UI:

```tsx
import type { RendererComponent } from "@lattice-php/lattice";

export const ColorPickerComponent: RendererComponent<"form.color-picker"> = ({ node }) => {
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

## 5. The plugin registration

The generator appended an entry to `resources/js/lattice/plugin.ts`:

```ts
import { createPlugin } from "@lattice-php/lattice";
import { ColorPickerComponent } from "./fields/color-picker";

export const appPlugin = createPlugin({
  name: "app",
  components: {
    "form.color-picker": ColorPickerComponent,
  },
});
```

`createPlugin` accepts any number of component type keys. You can also use `lazyComponent` for code-split renderers:

```ts
import { createPlugin, lazyComponent } from "@lattice-php/lattice";

export const appPlugin = createPlugin({
  name: "app",
  components: {
    "form.color-picker": lazyComponent(() =>
      import("./fields/color-picker").then((m) => m.ColorPickerComponent)
    ),
  },
});
```

## 6. Wire the plugin in app.tsx

Pass your plugin to `extendRegistry` and wrap the app in `Provider` with the extended registry:

```tsx
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice-php/lattice/page";
import { extendRegistry, Provider, registry } from "@lattice-php/lattice";
import { appPlugin } from "./lattice/plugin";

const appRegistry = extendRegistry(registry, appPlugin);

createInertiaApp({
  resolve: (name) => {
    if (name === "lattice/page") return { default: LatticePage };
    const pages = import.meta.glob("./Pages/**/*.tsx", { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (!el) return;
    createRoot(el).render(
      <Provider registry={appRegistry}>
        <App {...props} />
      </Provider>,
    );
  },
});
```

## 7. Generate TypeScript types

```bash
php artisan lattice:typescript
```

This writes `resources/js/lattice/generated.d.ts`, which augments the `ComponentProps` interface in `@lattice-php/lattice`:

```ts
declare module "@lattice-php/lattice" {
  interface ComponentProps {
    "form.color-picker": {
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
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('app.brand-settings')]
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

The field serializes to a node with `type: "form.color-picker"` and the renderer picks it up automatically.
