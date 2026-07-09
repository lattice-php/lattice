---
title: Navigation
description: The menus, dropdowns, and breadcrumbs you compose inside a layout to move around the app.
---

Navigation chrome lives inside a [layout](/core/layouts/) — the sidebars, menus, dropdowns, and
breadcrumbs that wrap your pages. These are server-driven components built from PHP, so a renamed route
or a changed permission updates the navigation with no client work. This page covers those components;
see [Layouts](/core/layouts/) for the shell they sit in.

## Menus

The sidebar's links are `Menu` and `MenuItem` components:

- `Sidebar::make()->collapsible()->items([...])` — the shell sidebar; `collapsible()` remembers its
  open state. Below the `md` breakpoint it becomes an off-canvas drawer instead of consuming layout
  width.
- The sidebar renders no toggle button itself. Place one wherever you like (typically the `Topbar`)
  with a `Button` that fires the `toggle-sidebar` effect on the client — see below.
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

## Toggling the sidebar

A `Button` can dispatch effects on the client when clicked — no request to the server. The
`toggle-sidebar` effect collapses the rail on desktop and opens the off-canvas drawer on mobile, so
the toggle button can live anywhere (here, in the `Topbar`):

```php
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Effects\Effect;

Button::make('Toggle sidebar', 'sidebar-toggle')
    ->icon('panel-left')
    ->variant(ButtonVariant::Ghost)
    ->effects(Effect::toggleSidebar('app-sidebar'));
```

`->effects()` accepts any effect, giving a button instant client-side behavior (open a modal, show a
toast, reset a form) without a round-trip.

## Dropdowns

`Dropdown` renders a composed trigger that reveals its `MenuItem`s in a popover — for grouping actions
without nesting them in the sidebar tree:

```php
use Lattice\Lattice\Core\Components\Icon;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\MenuItem;

Dropdown::make('account-menu')
    ->placement(Placement::Bottom)
    ->trigger([
        Icon::make('settings'),
        Text::make('Account'),
    ])
    ->items([
        MenuItem::fromPage(SettingsPage::class)->label('Settings'),
        MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
    ]);
```

## Raw blocks

`RawBlock` renders trusted server HTML. Use it for small layout-specific fragments such as an avatar,
team glyph, or badge when a dedicated Lattice component would be too specific:

```php
use Lattice\Lattice\Core\Components\RawBlock;

RawBlock::make('avatar')->blade('components.avatar', [
    'name' => $user->name,
    'src' => $user->avatar,
]);
```

Use `->html()` when the markup is already available:

```php
RawBlock::make('initials')->html('<span class="avatar">AL</span>');
```

## User dropdown

Build user menus from the same dropdown shell. The avatar, identity text, and menu placement are all
server-driven, so there is no dedicated frontend component:

```php
use Lattice\Lattice\Core\Components\RawBlock;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\MenuItem;

$user = $request->user();

Dropdown::make('user-menu')
    ->placement(Placement::Top)
    ->trigger([
        Stack::make('user-menu-trigger')->direction('row')->schema([
            RawBlock::make('avatar')->blade('components.avatar', [
                'name' => $user->name,
                'src' => $user->avatar,
            ]),
            Stack::make('user-menu-identity')->schema([
                Text::make($user->name),
                Text::make($user->email),
            ])->hideWhenCollapsed(),
        ]),
    ])
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
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\Components\RawBlock;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Sidebar;

Sidebar::make('app-sidebar')->collapsible()->items([
    Stack::make('sidebar-body')->width(Width::Fill)->justify(Justify::Between)->schema([
        Menu::make('sidebar')->items([
            MenuItem::fromPage(HomePage::class)->icon('house'),
        ]),
        Dropdown::make('user-menu')
            ->placement(Placement::Top)
            ->trigger([
                RawBlock::make('avatar')->blade('components.avatar', ['name' => $user->name]),
                Text::make($user->name)->hideWhenCollapsed(),
            ])
            ->items([
                MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
            ]),
    ]),
]);
```
