---
title: Fragments
description: A self-contained piece of UI resolved on its own endpoint, so it can load and reload independently of the page.
---

A fragment is a slice of UI that resolves on its own — separate from the page that hosts it. Because
it has its own endpoint, it can load lazily and be reloaded on its own, which makes it a good fit for
expensive panels, deferred content, or UI an [action](/actions/overview/) wants to refresh.

## Defining a fragment

Extend `FragmentDefinition` and build its `schema()`, the same way a page does. The `#[Fragment]`
attribute registers it.

```php
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[Fragment('app.two-factor-setup')]
class TwoFactorSetupFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Scan the QR code to finish setup.'));
    }
}
```

## Rendering a fragment

Render it with `Fragment::lazy()`, passing the definition class. The page ships a placeholder and the
fragment fetches its own schema from its endpoint when it mounts.

```php
use Lattice\Lattice\Fragments\Components\Fragment;

Fragment::lazy(TwoFactorSetupFragment::class);
```

## Reloading a fragment

A fragment is addressed by its id, so an action can refresh it with the
[`reloadComponent`](/actions/effects/#refreshing-what-changed) effect — re-running its `schema()`
without touching the rest of the page:

```php
return ActionResult::success()->reloadComponent('app.two-factor-setup');
```

Fragments honor [authorization](/core/authorization/) like any definition: an unauthorized fragment
resolves to nothing.
