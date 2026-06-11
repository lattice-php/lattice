---
title: Navigation
description: App shells and menus, defined as a schema-driven layout in PHP and rendered around your pages.
---

Navigation lives in a **layout** — a server-side definition of the app shell (sidebar, menu, header)
that wraps your pages. A page picks a layout, and its content renders into the layout's outlet.

## Layouts

Extend `LayoutDefinition` and build the shell in `schema()`. The `#[Layout]` attribute gives it an id;
mark where the page renders with `Outlet::make()`.

```php
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\LayoutDefinition;

#[Layout('app')]
final class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')->direction('row')->schema([
                Sidebar::make('app-sidebar')->collapsible()->items([
                    Menu::make('sidebar')->items([
                        MenuItem::fromPage(HomePage::class)->icon(LucideIcon::House),
                        MenuItem::make('Tables')->icon(LucideIcon::Table)->children([
                            MenuItem::fromPage(ProductsPage::class)->label('Products'),
                        ]),
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

## Choosing a layout

A page selects its layout by returning a `PageLayout` from `layout()`, and a width treatment from
`container()`:

```php
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;

public function layout(): PageLayout
{
    return PageLayout::App; // App, Auth, or None
}

public function container(): PageContainer
{
    return PageContainer::Default; // Default or Centered
}
```

`PageLayout::App` renders inside your app shell, `Auth` uses the bare auth layout (sign-in and the
like), and `None` renders the page with no shell.

## Menus

The sidebar's links are `Menu` and `MenuItem` components:

- `Sidebar::make()->collapsible()->items([...])` — the shell sidebar; `collapsible()` remembers its
  open state.
- `Menu::make()->items([...])` — a list of menu items.
- `MenuItem::make($label)->href($url)->icon($icon)` — a link. Nest a group with `->children([...])`.
- `MenuItem::fromPage(SomePage::class)` — builds an item that links to a page's route automatically,
  so the URL stays in sync with the page. Override the label with `->label()`.

```php
MenuItem::fromPage(ProductsPage::class)->label('Products')->icon(LucideIcon::Table);
```

Because menu items reference pages by class, navigation can't drift out of sync with the pages it
links to — a renamed route updates the link with no extra work.
