# Upgrade Guide

## 0.49 → 0.50

`@lattice-php/api-reference` is now also published to npm for standalone React/Astro use, and two
refactors carry breaking changes: label actions are components on every field, and
`@lattice-php/ui` navigates through an adapter instead of importing Inertia.

### Label actions are components on every field

`->labelAction()` moved from `PasswordInput` to the shared `Field` base and takes a component
instead of label/href strings:

```diff
-PasswordInput::make('password', 'Password')
-    ->labelAction('Forgot password?', route('password.request'), 3);
+PasswordInput::make('password', 'Password')
+    ->labelAction(Link::make('Forgot password?')->href(route('password.request'))->tabIndex(3));
```

The `Lattice\Form\Components\LabelAction` value object and the generated `LabelAction` TypeScript
type (exported from `@lattice-php/form`) are removed; the wire prop is a regular node. Every field
now serializes `labelAction` (`null` when unset), so consumers asserting exact wire shapes gain a
key. On the JS side, `FormFieldFrame`'s `labelAction` prop takes a rendered `ReactNode`.

### ui navigates through an adapter

`@lattice-php/ui` no longer imports `@inertiajs/react` — its peer dependency is gone. Links and
programmatic visits resolve through `NavigationProvider`/`useNavigation`
(`@lattice-php/ui/navigation`); without a provider, links render as plain anchors and visits are
full page loads. Lattice apps need no change: `createLatticeApp` and `<Provider>` seed an
Inertia-backed adapter.

- `TextLink` takes anchor props plus `method`. Inertia-specific props (`preserveScroll`, `data`,
  `only`, …) moved behind the adapter.
- The built-in `redirect` and `reload-page` effects default to `window.location`. The framework
  registry overrides them with SPA handlers; apps passing a hand-rolled registry to
  `createLatticeApp` should include `navigationPlugin` (exported from the runtime and
  `@lattice-php/lattice`) to keep SPA behavior.
- `useFlashEffects` moved from `@lattice-php/ui` to the framework package.
- Standalone consumers of ui components can seed their own router via
  `<NavigationProvider adapter={...}>`.

## 0.47 → 0.48

Width is now decided by containers alone. Components that used to pin their own measure fill
whatever contains them, and a page states its measure once.

### Pages declare a width

`PageContainer` is gone. `#[AsPage(container:)]` becomes `#[AsPage(width:)]` and takes a
`PageWidth` (`Full`, `Large`, `Medium`, `Small`); `Page::container()` becomes `Page::width()`.

```diff
-#[AsPage(route: '/products', layout: PageLayout::App, container: PageContainer::Default)]
+#[AsPage(route: '/products', layout: PageLayout::App, width: PageWidth::Full)]
```

`PageContainer::Default` maps to `PageWidth::Full`, and `Full` is now what a page inherits when it
declares no width — so most `container:` arguments can simply be dropped. It used to be `Centered`,
which is why nearly every page spelled the argument out.

`PageContainer::Centered` has no direct replacement: besides its max width it centred the page
vertically, applied a wider padding step and added a `<main>` wrapper. Vertical centring belongs to
a layout — give the layout a full-height stack, the way the auth layouts already do:

```php
Stack::make('auth-shell')->height(Height::Screen)->justify(Justify::Center)->align(Align::Center)
```

The page container also used to drop its padding when a page rendered without a layout. Padding is
now always applied and scales by breakpoint, so standalone pages no longer sit flush against the
viewport edge.

### Forms, text and headings fill their container

`Form::fullWidth()` is removed; forms always fill their container. `Text` and `Heading` no longer
cap themselves at `max-w-2xl`/`max-w-3xl`. Where a reading measure matters, set it on the page or
wrap the content:

```diff
-Form::use(ProfileForm::class)->fullWidth()
+Form::use(ProfileForm::class)
```

```php
#[AsPage(route: '/products/create', width: PageWidth::Medium)]   // whole page shares the measure
Stack::make('editor')->width(Width::Medium)->schema([...])       // or one zone of it
```

Pages that relied on the form's implicit `max-w-2xl` need one of the two above, or their inputs
stretch to the full content width.

## 0.42 → 0.43

`#[AsPage(middleware: ...)]` now **merges after** the `lattice.pages.middleware` config default
(`['web']`) instead of replacing it. A page declaring `middleware: 'auth'` registers with
`['web', 'auth']` — drop any re-declared defaults from page attributes. The `middleware: []`
opt-out is gone; to change the base stack for all pages, change the config value.

## 0.38 → 0.40 (the monorepo split)

0.39 split the single `lattice-php/lattice` package into per-domain packages; 0.40 moved the
umbrella into `packages/framework`. Applications keep requiring `lattice-php/lattice` (Composer)
and `@lattice-php/lattice` (npm) — the umbrella depends on all split packages, so installation
does not change. What changes are namespaces and import paths.

The split packages, usable directly by extension packages that only need a slice:

| Composer | npm | PHP namespace |
| --- | --- | --- |
| `lattice-php/core` | `@lattice-php/core` | `Lattice\Core\` |
| `lattice-php/ui` | `@lattice-php/ui` | `Lattice\Ui\` |
| `lattice-php/form` | `@lattice-php/form` | `Lattice\Form\` |
| `lattice-php/table` | `@lattice-php/table` | `Lattice\Table\` |
| `lattice-php/action` | `@lattice-php/action` | `Lattice\Actions\` |
| `lattice-php/tree` | — (ships its JS via Composer) | `Lattice\Tree\` |
| `lattice-php/lattice` (umbrella) | `@lattice-php/lattice` | `Lattice\` |

### PHP namespaces

The old `Lattice\Lattice\` root is gone. Mapping by old `src/` subdirectory:

| 0.38 | 0.40 |
| --- | --- |
| `Lattice\Lattice\Core\*` | `Lattice\Core\*` |
| `Lattice\Lattice\Attributes\*` | `Lattice\Core\Attributes\*` |
| `Lattice\Lattice\Actions\*` | `Lattice\Actions\*` |
| `Lattice\Lattice\Forms\*` | `Lattice\Form\*` (e.g. `Lattice\Form\FormDefinition`) |
| `Lattice\Lattice\Tables\*` | `Lattice\Table\*` |
| `Lattice\Lattice\Ui\*` | `Lattice\Ui\*` |
| `Lattice\Lattice\Effects\*` | `Lattice\Ui\Effects\*` |
| `Lattice\Lattice\I18n\*` | `Lattice\Ui\I18n\*` |
| everything else (`Facades`, `Http`, `Layouts`, …) | `Lattice\*` |

A project-wide find/replace of `Lattice\Lattice\` handling the table above covers almost all of it;
the compiler and PHPStan catch the rest.

### Form responses: `toast()` and friends moved to `Effects`

`FormDefinition`'s protected response helpers (`toast()`, …) are gone. Build responses through the
`Lattice\Facades\Effects` facade instead — the fluent builder is the same on action results and
form responses:

```php
use Lattice\Facades\Effects;

return Effects::respond()->toast(__('Saved'))->back();
```

### JS: `createPlugin` removed

Plugins are plain objects checked against the `Plugin` type:

```ts
// 0.38
import { createPlugin, lazyComponent } from "@lattice-php/lattice";

export default createPlugin({
  name: "my/plugin",
  components: { tree: lazyComponent(() => import("./tree")) },
});

// 0.40
import { lazyComponent, type Plugin } from "@lattice-php/core/registry";

export default {
  name: "my/plugin",
  components: { tree: lazyComponent(() => import("./tree")) },
} satisfies Plugin;
```

### JS: rich-editor extensions are declarative

`registerRichEditorExtension(name, ...)` is gone. Declare extensions on your plugin under the
`"form.rich-editor"` key:

```ts
import type { RichEditorExtensionRegistry } from "@lattice-php/form/rich-editor";

export default {
  name: "app",
  extensions: {
    "form.rich-editor": {
      mention: {
        extensions: (props) => [Mention.configure({ triggers: props.triggers ?? ["@"] })],
        toolbar: () => [/* ... */],
      },
    } satisfies RichEditorExtensionRegistry,
  },
} satisfies Plugin;
```

### JS: moved import subpaths

The umbrella still re-exports the common surface from `@lattice-php/lattice`, but the deep
subpaths moved to the split packages:

| 0.38 | 0.40 |
| --- | --- |
| `@lattice-php/lattice/core` | `@lattice-php/core` |
| `@lattice-php/lattice/form/*` | `@lattice-php/form/*` |
| `@lattice-php/lattice/icons` | `@lattice-php/ui/icons` |
| `@lattice-php/lattice/i18n` | `@lattice-php/ui/i18n` |
| `@lattice-php/lattice/effects/*` | `@lattice-php/ui/effects/*` |
| `cn` (was in `…/core`) | `@lattice-php/ui/lib/utils` |
| `usePersistentState` (was in `…/core`) | `@lattice-php/ui/lib/use-persistent-state` |

If an import no longer resolves, look for the same path under `@lattice-php/core`,
`@lattice-php/ui`, `@lattice-php/form`, `@lattice-php/table`, or `@lattice-php/action`.
