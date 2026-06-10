---
title: Quickstart
description: Build your first server-driven page with Lattice and route it.
---

This guide builds a single page from PHP, registers a route for it, and adds it to the sidebar. It assumes you have completed [Installation](/getting-started/installation/) and [Frontend Setup](/getting-started/frontend-setup/).

## Define a page

A page extends `Lattice\Lattice\Http\Page`. It returns a `title()` and builds its UI in `render()` by populating the `PageSchema` with components.

```php
<?php

namespace App\Pages;

use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Core\PageSchema;

final class DashboardPage extends Page
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

Lattice registers a `latticePage` route macro. Point a URI at your page class, and optionally add it to the sidebar with a label and an icon:

```php
use App\Pages\DashboardPage;
use Lattice\Lattice\Core\Enums\LucideIcon;
use Illuminate\Support\Facades\Route;

Route::latticePage('/dashboard', DashboardPage::class)
    ->sidebar('Dashboard', LucideIcon::House);
```

Visit `/dashboard` and the page renders through Inertia — no Inertia page component or controller to write by hand.

## Where to go next

- [Forms](/getting-started/installation/) and [Tables](/getting-started/installation/) reference (coming next) for data entry and listings.
- [Configuration](/getting-started/configuration/) to register definitions and tune discovery.
