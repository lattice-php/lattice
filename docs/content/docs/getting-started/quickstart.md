---
title: Quickstart
description: Build your first server-driven page with Lattice and route it.
---

This guide builds a single page from PHP, registers a route for it, and adds it to the sidebar. It assumes you have completed [Installation](/getting-started/installation/) and [Frontend Setup](/getting-started/frontend-setup/).

## Define a page

A page extends `Bambamboole\Lattice\Page`. It returns a `title()` and builds its UI in `render()` by populating the `PageSchema` with components.

```php
<?php

namespace App\Pages;

use Bambamboole\Lattice\Components\Core\Card;
use Bambamboole\Lattice\Components\Core\Grid;
use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Core\Text;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;

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
use Bambamboole\Lattice\Enums\LucideIcon;
use Illuminate\Support\Facades\Route;

Route::latticePage('/dashboard', DashboardPage::class)
    ->sidebar('Dashboard', LucideIcon::House);
```

Visit `/dashboard` and the page renders through Inertia — no Inertia page component or controller to write by hand.

## Where to go next

- [Forms](/getting-started/installation/) and [Tables](/getting-started/installation/) reference (coming next) for data entry and listings.
- [Configuration](/getting-started/configuration/) to register definitions and tune discovery.
