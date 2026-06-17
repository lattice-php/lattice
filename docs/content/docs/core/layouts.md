---
title: Layouts
description: The app shell a page renders into — a server-side definition with an outlet that marks where the page's content goes.
---

A layout is the shell that wraps your pages — the sidebar, header, and chrome that stay put while the
page inside them changes. Like everything else in Lattice it is a server-side definition that builds a
component tree, with one `Outlet` marking where the active [page](/core/pages/) renders.

## Defining a layout

Extend `LayoutDefinition` and build the shell in `schema()`. The `#[AsLayout]` attribute registers it
under a key, and `Outlet::make()` marks where the page's content appears:

```php
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\LayoutDefinition;

#[AsLayout('app')]
final class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')->direction('row')->schema([
                Sidebar::make('app-sidebar')->collapsible()->items([
                    Menu::make('sidebar')->items([
                        MenuItem::fromPage(HomePage::class)->icon('house'),
                        MenuItem::fromPage(ProductsPage::class)->label('Products'),
                    ]),
                ]),
                Stack::make('app-main')->width(Width::Fill)->schema([
                    Outlet::make(),
                ]),
            ]),
        ]);
    }
}
```

`schema()` receives the `Request`, so the shell can adapt to the current user — highlighting the active
section, showing an avatar, or hiding links a visitor can't reach.

## The outlet

A layout's schema must contain **exactly one** `Outlet`. It carries no markup of its own; it is the
seam where Lattice drops the active page's component tree. Everything around it — sidebar, breadcrumbs,
header — is shared chrome rendered once and left in place as the page changes.

## The header bar

`Topbar` is a horizontal bar for chrome that sits above the page — a logo, search, settings menu, or
appearance switcher. Call `->sticky()` to keep it pinned to the top of the viewport as the page
scrolls, and `->items([...])` to fill it:

```php
use Lattice\Lattice\Layouts\Components\Topbar;

Topbar::make('app-topbar')->sticky()->items([
    Menu::make('topbar-settings')->items([
        MenuItem::make('Settings', 'settings'),
    ]),
]);
```

## Callouts

`Callouts` marks where flashed and action-emitted [callouts](/actions/effects/#callouts) render inside
the shell — the persistent banners an action or a redirect can raise. Place it once, typically between
the header bar and the `Outlet`:

```php
use Lattice\Lattice\Layouts\Components\Callouts;

Stack::make('app-main')->width(Width::Fill)->schema([
    Callouts::make(),
    Outlet::make(),
]);
```

Without a `Callouts` slot, callout effects have nowhere to render.

## Choosing a layout

A page selects its layout in its [`#[AsPage]` attribute](/core/pages/#the-aspage-attribute), not with a
method. Pass a [`PageLayout`](/advanced/enums/#pages) for the common shells, or a string matching a
`#[AsLayout]` key:

```php
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;

#[AsPage(route: '/products', layout: PageLayout::App, container: PageContainer::Default)]
class ProductsPage extends Page {}
```

`PageLayout::App` and `PageLayout::Auth` are conventional keys (`app`, `auth`) for the two shells most
apps need — a signed-in application frame and a bare authentication screen. `PageLayout::None` opts out
entirely: the page renders with no shell, which is what auth and error screens usually want. A custom
key works the same way — register the layout with `#[AsLayout('marketing')]` and reference it with
`layout: 'marketing'`.

Because the layout is set on the attribute, a [base page](/core/pages/#shared-base-pages) can pick it
once for a whole section and concrete pages inherit it.

## Registration

Layouts are discovered from the paths in `config('lattice.discover')` just like pages and the other
definitions. Register a layout that lives elsewhere explicitly:

```php
use Lattice\Lattice\Facades\Lattice;

Lattice::layouts([AppLayout::class]);
```

## What goes inside a layout

The shell is built from the same components as a page, plus a set made for navigation chrome —
`Sidebar`, `Topbar`, `Menu`, `MenuItem`, `Dropdown`, and `Breadcrumbs`. Those are covered in
[Navigation](/core/navigation/).
</content>
