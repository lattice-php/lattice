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
use Lattice\Ui\Enums\HttpMethod;

MenuItem::make('Log out')->href(route('logout', absolute: false))->icon('log-out')->method(HttpMethod::Post);
```

## Toggling the sidebar

A `Button` can dispatch effects on the client when clicked — no request to the server. The
`toggle-sidebar` effect collapses the rail on desktop and opens the off-canvas drawer on mobile, so
the toggle button can live anywhere (here, in the `Topbar`):

```php
use Lattice\Ui\Components\Button;
use Lattice\Ui\Enums\Emphasis;
use Lattice\Facades\Effects;

Button::make('Toggle sidebar', 'sidebar-toggle')
    ->icon('panel-left')
    ->emphasis(Emphasis::Ghost)
    ->effects(Effects::toggleSidebar('app-sidebar'));
```

`->effects()` accepts any effect, giving a button instant client-side behavior (open a modal, show a
toast, reset a form) without a round-trip.

## Dropdowns

`Dropdown` renders a composed trigger that reveals its `MenuItem`s in a popover — for grouping actions
without nesting them in the sidebar tree:

```php
use Lattice\Ui\Components\Icon;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Placement;
use Lattice\Ui\Components\Dropdown;
use Lattice\Ui\Components\MenuItem;

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
use Lattice\Ui\Components\RawBlock;

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
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Placement;
use Lattice\Ui\Components\Dropdown;
use Lattice\Ui\Components\MenuItem;

$user = $request->user();

Dropdown::make('user-menu')
    ->placement(Placement::Top)
    ->trigger([
        Stack::make('user-menu-trigger')->direction(Orientation::Horizontal)->schema([
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

`Breadcrumbs::make()` renders the current page's breadcrumb trail. Drop it once in your layout (a
header bar is the usual spot) and every page fills it in: when the layout serializes, the component
picks up whatever the active page returned from `Page::breadcrumbs()` (or set through
`$schema->breadcrumbs()`) and sends the items down with the node:

```php
use Lattice\Ui\Components\Breadcrumbs;

Stack::make('app-main')->width(Width::Fill)->schema([
    Breadcrumbs::make(),
    Outlet::make(),
]);
```

Pass `->items([...])` with `Breadcrumb` values to render a fixed trail instead of the page's — an empty
array renders nothing, regardless of the page.

## Pinning a sidebar footer

To keep navigation at the top of the sidebar and, say, a user menu pinned to the bottom, pass the
bottom components to `->footer([...])`:

```php
use Lattice\Ui\Enums\Placement;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Components\Dropdown;
use Lattice\Ui\Components\Menu;
use Lattice\Ui\Components\MenuItem;
use Lattice\Ui\Components\Sidebar;

Sidebar::make('app-sidebar')->collapsible()
    ->items([
        Menu::make('sidebar')->items([
            MenuItem::fromPage(HomePage::class)->icon('house'),
        ]),
    ])
    ->footer([
        Dropdown::make('user-menu')
            ->placement(Placement::Top)
            ->trigger([
                RawBlock::make('avatar')->blade('components.avatar', ['name' => $user->name]),
                Text::make($user->name)->hideWhenCollapsed(),
            ])
            ->items([
                MenuItem::make('Log out')->href(route('logout', absolute: false))->method(HttpMethod::Post),
            ]),
    ]);
```

Give dropdowns in the footer `Placement::Top` so they open upward.

## Client-side chrome

The React components behind `Sidebar`, `Topbar`, `Breadcrumbs`, `Menu`, `MenuItem`, and `Dropdown` are
exported from `@lattice-php/ui` for custom pages and component packages. They take plain props instead
of wire nodes: the Lattice adapters add the toggle-sidebar event, the remembered collapse state, the
page's breadcrumb trail, and the active-item detection on top of them.

```tsx
import {
  Breadcrumbs,
  Dropdown,
  Menu,
  MenuItem,
  Sidebar,
  SidebarFooter,
  Topbar,
} from "@lattice-php/ui";

<Sidebar collapsed={collapsed} open={drawerOpen} onOpenChange={setDrawerOpen}>
  <Menu aria-label="Main">
    <MenuItem active={pathname === "/"} href="/" label="Home" prefix={<HomeIcon />} />
    <MenuItem label="Catalog" defaultOpen>
      <MenuItem href="/products" label="Products" />
    </MenuItem>
    <MenuItem label="Log out" onClick={logout} />
  </Menu>
  <SidebarFooter>
    <Dropdown placement="top" trigger={<span>{user.name}</span>}>
      <ul>…</ul>
    </Dropdown>
  </SidebarFooter>
</Sidebar>

<Topbar sticky>
  <Breadcrumbs items={[{ href: "/dashboard", label: "Dashboard" }, { label: "Settings" }]} />
</Topbar>
```

`Sidebar` collapses the desktop rail to icons while `collapsed` is true (children read it through
`useCollapsed()`), and renders the mobile drawer with a backdrop while `open` is true — closing it on
backdrop click and Escape through `onOpenChange`. `MenuItem` renders a link with `href`, a button
with `onClick`, a section header with neither, and a collapsible group when it has children (a flyout
while the sidebar is collapsed); `open`/`onOpenChange` control the group, `defaultOpen` seeds it.
`Dropdown` is a popover with menu semantics that closes on every navigation. `Breadcrumbs` links every
item with an `href` and marks the last one as the current page.

Links go through the active `NavigationProvider`, so they become Inertia visits inside a Lattice app.
The adapter also exposes the location: `useNavigation().currentUrl` is the current path (the Lattice
runtime seeds it from the Inertia page and tracks visits; without a provider it falls back to
`window.location.pathname`), and `useNavigation().onNavigate(listener)` subscribes to completed
navigations and returns the unsubscribe — the sidebar drawer and dropdowns close through it.
Standalone consumers can supply both on their own adapter.
