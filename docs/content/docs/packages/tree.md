---
title: Tree
description: Hierarchy rendering from inline nodes, callbacks, or Eloquent sources, with keyboard navigation, actions, drag-and-drop moving, and lazy loading.
---

The tree package renders hierarchies from inline nodes, callbacks, or Eloquent
adjacency-list sources — with full keyboard navigation (roving tabindex, typeahead), per-node
icons, badges, links, and actions, and lazy child loading over a signed endpoint. Registered
Lattice actions handle selection and optimistic drag-and-drop moving without coupling the
package to application persistence.

## Installation

```bash
composer require lattice-php/tree
```

That is the whole integration: the package ships its React renderer as source, and the
`lattice()` Vite plugin compiles it into your app's bundle via `virtual:lattice/plugins`
(see [Component packages](/extending/component-packages/)). The PHP classes are picked up by
Lattice's discovery and TypeScript generation automatically.

:::note
There is no npm package — Composer is the only install.
:::

## Usage

```php
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;

Tree::make('categories')->nodes([
    TreeNode::make('electronics', 'Electronics')
        ->icon('cpu')
        ->children([
            TreeNode::make('electronics-laptops', 'Laptops'),
            TreeNode::make('electronics-phones', 'Phones')->href('/products/phones'),
        ]),
])->defaultExpanded(['electronics']);
```

Nodes compile their conveniences (`->icon()`, `->badge()`, `->href()`, `->action()`/`->actions()`)
into a canonical body schema of core components — an icon, a text-or-link label, a badge, and an
end-floated action stack. `->badge($label, $color)` accepts any Lattice color.

### Custom node content

For content the conveniences do not cover, `->schema()` replaces the composed body outright:

```php
use Lattice\Ui\Components\Avatar;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Text;

TreeNode::make('acme-corp', 'Acme Corp')
    ->schema([
        Avatar::make('/avatars/acme.png'),
        Text::make('Acme Corp'),
        Badge::make('Pro')->color('purple'),
    ]);
```

:::caution
`->schema()` is an escape hatch, not an addition — it replaces the default body entirely.
`label` is still required and keeps driving typeahead and aria announcements even when the schema
does not render it. On Enter/Space, a node without an `href` activates the first button found in
its body, so a custom schema should put its primary action's button first — or expect it to
receive Enter.
:::

### Eloquent sources

Back a tree with an Eloquent adjacency list (a self-referencing `parent_id` column):

```php
use Lattice\Tree\EloquentTreeSource;

Tree::make('categories')->source(
    EloquentTreeSource::make(Category::class)
        ->orderBy('sort_order')
        ->map(fn (Category $category, TreeNode $node) => $node
            ->badge((string) $category->products_count)
            ->disabled(! $category->is_active)
            ->href(route('categories.show', $category))),
);
```

`->orderBy()` orders roots and every sibling group by that column, followed by the label and ID
for deterministic ties. Without it, label and ID remain the default ordering. The single
`->map()` callback receives the model and its base `TreeNode`, and applies equally to eager and
lazy results.

Any other backing store implements the two-method `Lattice\Tree\TreeSource` contract.

## Selection and moving

Attach registered Lattice [actions](/actions/overview/) to receive generic interaction payloads:

```php
Tree::use(CategoryTree::class)
    ->activeId(request()->string('category')->toString() ?: null)
    ->selectAction(SelectCategory::class) // { nodeId }
    ->moveAction(MoveCategory::class);    // { nodeId, parentId, position }
```

Clicking a row selects it; expander, link, and node-action clicks keep their own behavior. The
active row updates optimistically and follows later `activeId` props, so a URL parameter can
remain the authoritative selection.

`moveAction()` enables pointer moving between parents and the root. The zero-based `position` is
the node's final sibling position. The client prevents disabled and cyclic drops, rolls back
rejected requests, and offers `Ctrl+Shift+Arrow` keys: Up/Down reorder, Right indents, and Left
outdents.

:::note
The consuming application owns persistence and authoritative validation — the package never
writes a `sort_order` column itself.
:::

## Lazy loading

Serializing a large hierarchy eagerly is wasteful. Register a tree definition and let expansion
fetch one level per request instead:

```php
use Lattice\Tree\AsTree;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeSource;

#[AsTree('categories')]
class CategoryTree extends TreeDefinition
{
    public function source(): TreeSource
    {
        return EloquentTreeSource::make(Category::class);
    }
}
```

```php
Tree::use(CategoryTree::class)->lazy();     // roots eager, deeper levels fetched on expand
Tree::use(CategoryTree::class)->lazy(2);    // two levels eager
Tree::use(CategoryTree::class)->lazy(0);    // bare skeleton — even the roots are fetched
```

Passing `->activeId($id)` to an Eloquent-backed tree resolves that node's ancestors, then loads,
expands, and focuses the node through lazy levels. Custom `TreeSource` implementations return the
ancestor IDs from `path()`. After a mutation, change `->revision($key)` to discard cached lazy
children and refetch expanded branches while preserving active and focus state.

The definition is discovered like any Lattice definition (`#[AsTree]` + Lattice's discovery
paths), and the serialized tree carries a sealed reference — the same
[signing machinery](/core/authorization/) Lattice tables use — that the package's
`lattice/trees/{tree}` endpoint verifies before resolving the definition again with the identical
context. `authorize()` on the definition gates both the initial render and every fetch. The
route's middleware and path follow Lattice's group conventions:
`config('lattice.trees.middleware', ['web', 'auth'])` and
`config('lattice.trees.endpoint', 'lattice/trees/{tree}')`.

An `EloquentTreeSource` behind the endpoint automatically switches to per-level queries
(`WHERE parent_id = ?` plus a scoped `EXISTS` probe for `hasChildren`) instead of loading the
whole table. Inline `->nodes()` / `->source()` trees stay eager-only — without a registry key
there is nothing to seal — so `->lazy()` on them throws.

## Translations

The component's strings ship with inline English defaults. With
[laravel-i18next](https://github.com/bambamboole/laravel-i18next) enabled, the plugin's `tree`
namespace is loaded automatically and serves the bundled `en`/`de` translations (override them
like any Laravel package translation — see [Internationalization](/core/i18n/)).
