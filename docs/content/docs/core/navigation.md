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
                        MenuItem::fromPage(HomePage::class)->icon('house'),
                        MenuItem::make('Tables')->icon(Icon::Table)->children([
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
MenuItem::fromPage(ProductsPage::class)->label('Products')->icon(Icon::Table);
```

Because menu items reference pages by class, navigation can't drift out of sync with the pages it
links to — a renamed route updates the link with no extra work.

A menu item can submit with a non-GET method — useful for a logout link — by setting `->method()`:

```php
use Lattice\Lattice\Core\Enums\HttpMethod;

MenuItem::make('Log out')->href(route('logout', absolute: false))->icon('log-out')->method(HttpMethod::Post);
```

## Dropdowns

`Dropdown` renders a trigger that reveals its `MenuItem`s in a popover — for grouping actions without
nesting them in the sidebar tree:

```php
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Layouts\Components\Dropdown;

Dropdown::make('Account')->icon(Icon::Settings)->items([
    MenuItem::fromPage(SettingsPage::class)->label('Settings'),
    MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
]);
```

## User menu

`UserMenu` is a dropdown specialised for the signed-in user: it shows an avatar (or the user's
initials when no image is set) with their name and email, and opens to the items you give it. Configure
it from the request in your layout:

```php
use Lattice\Lattice\Layouts\Components\UserMenu;

$user = $request->user();

UserMenu::make()
    ->name($user->name)
    ->email($user->email)
    ->avatar($user->avatar)
    ->items([
        MenuItem::fromPage(SettingsPage::class)->label('Settings'),
        MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
    ]);
```

## Breadcrumbs

`Breadcrumbs::make()` renders the current page's breadcrumb trail. It carries no data of its own — it
reads whatever the active page returns from `Page::breadcrumbs()`, so drop it once in your layout (a
header bar is the usual spot) and every page fills it in:

```php
use Lattice\Lattice\Layouts\Components\Breadcrumbs;

Stack::make('app-main')->width(Width::Fill)->schema([
    Breadcrumbs::make(),
    Outlet::make(),
]);
```

## Pinning a sidebar footer

To keep navigation at the top of the sidebar and a user menu pinned to the bottom, wrap them in a
full-height `Stack` with `->justify(Justify::Between)`. A column `Stack` lays out as a grid by default;
giving it a `justify` switches it to a flex column so the space distributes:

```php
use Lattice\Lattice\Core\Enums\Justify;
use Lattice\Lattice\Core\Enums\Width;

Sidebar::make('app-sidebar')->collapsible()->items([
    Stack::make('sidebar-body')->width(Width::Fill)->justify(Justify::Between)->schema([
        Menu::make('sidebar')->items([
            MenuItem::fromPage(HomePage::class)->icon('house'),
        ]),
        UserMenu::make()->name($user->name)->email($user->email)->avatar($user->avatar)->items([
            MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
        ]),
    ]),
]);
```
