---
title: Getting Started
description: Build your first server-driven page with Lattice and route it.
---

This guide builds a single page from PHP and registers a route for it. It assumes you have completed [Installation](/introduction/installation/).

## Define a page

A page extends `Lattice\Lattice\Http\Page`. It returns a `title()` and builds its UI in `render()` by populating the `PageSchema` with components.

```php
<?php

namespace App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page as BasePage;

#[Page(route: '/dashboard', layout: PageLayout::App, middleware: ['web'])]
final class DashboardPage extends BasePage
{
    public function title(): string
    {
        return 'Dashboard';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('dashboard')
                ->gap(Gap::Large)
                ->children([
                    Heading::make('Dashboard'),
                    Text::make('Everything below is described in PHP and rendered as React.'),
                    Grid::make('stats')
                        ->columns(2)
                        ->children([
                            Card::make('Orders', '128 this week.'),
                            Card::make('Revenue', '$4,210 this week.'),
                        ]),
                ]),
        ]);
    }
}
```

## Route the page

There is no route file entry to write. Lattice scans the paths in `lattice.discover` (`app/` by default), finds every class carrying a `#[Page]` attribute, and registers a route for it automatically. The route name auto-derives from the URI (`/dashboard` → `dashboard`); supply `name:` in the attribute to override it.

Visit `/dashboard` and the page renders through Inertia — no route file entry, no controller, and no Inertia page component to write by hand.

### Sharing layout and middleware across pages

Rather than repeating `layout:` and `middleware:` on every page, declare a shared base page and inherit from it:

```php
use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Http\Page as BasePage;

#[Page(layout: PageLayout::App, middleware: ['web'])]
abstract class AppPage extends BasePage {}

#[Page(route: '/dashboard')] // inherits layout + web middleware
final class DashboardPage extends AppPage { /* title(), render() */ }
```

Pages need the `web` middleware group for sessions, CSRF, and route-model binding. Setting it once on the shared base keeps individual pages clean.

To register pages explicitly — for example from a package — call `Lattice::pages([DashboardPage::class])` in a service provider instead of relying on discovery.

## Navigation

Navigation (sidebar and menus) is built from `Menu` and `Sidebar` layout components in PHP. See [Navigation](/core/navigation/) for details.

## Where to go next

- [Forms](/forms/overview/) and [Tables](/tables/overview/) for data entry and listings.
- [Configuration](/introduction/configuration/) to register definitions and tune discovery.
- [Extending Lattice](/extending/overview/) to add custom fields, components, and columns.
