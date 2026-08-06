# Upgrade Guide

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
