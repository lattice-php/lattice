---
title: Pages
description: The entry point of a Lattice screen — a PHP class that builds a component tree and renders through Inertia.
---

A page is the entry point of a Lattice screen. It extends `Lattice\Lattice\Http\Page`, declares its
route with a `#[AsPage]` attribute, and builds its UI in `render()`. Lattice discovers the class,
registers a route for it, and renders it through Inertia — you write no controller and no Inertia page
component of your own.

```php
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Tables\Components\Table;

#[AsPage(route: '/products')]
class ProductsPage extends Page
{
    public function title(): string
    {
        return 'Products';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Heading::make('Products'),
            Table::use(ProductsTable::class),
        ]);
    }
}
```

## Building the UI

`render()` receives a fresh `PageSchema` and returns it with its components attached. Pass the whole
tree at once with `->schema([...])`, or append components one at a time with `->component()`:

```php
public function render(PageSchema $schema): PageSchema
{
    return $schema
        ->component(Heading::make('Products'))
        ->component(Table::use(ProductsTable::class));
}
```

The components are the same [building blocks](/components/overview/) used everywhere else — layout
primitives like `Stack`, content like `Heading` and `Text`, and the interactive
[forms](/forms/overview/), [tables](/tables/overview/), and [actions](/actions/overview/) that carry
their own endpoints.

## Route parameters

`render()` is dispatched like a controller method, so route parameters and route-model binding resolve
straight into its signature alongside the `PageSchema`:

```php
use Workbench\App\Models\Product;

#[AsPage(route: '/products/{product}/edit')]
class ProductEditPage extends Page
{
    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema->schema([
            Heading::make("Edit {$product->name}"),
            // …
        ]);
    }
}
```

Anything the container can resolve — a `Request`, a service, a bound model — can be type-hinted here
too.

## The `#[AsPage]` attribute

`#[AsPage]` declares how the page is routed and framed:

| Argument     | Purpose                                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `route`      | The URL path. Supports parameters (`/products/{product}/edit`).                                                                                                      |
| `name`       | The route name. Defaults to the route segments joined by dots (`products.edit`), falling back to the class name without its `Page` suffix.                           |
| `layout`     | The [layout](/core/layouts/) the page renders into — a [`PageLayout`](/advanced/enums/#pages) or a registered layout key. Defaults to `PageLayout::None` (no shell). |
| `container`  | How the content is framed — a [`PageContainer`](/advanced/enums/#pages) (`Default` or `Centered`). Defaults to `PageContainer::Centered`.                            |
| `middleware` | Middleware for the page's route — a string or an array.                                                                                                              |

```php
use Lattice\Lattice\Ui\Enums\PageContainer;
use Lattice\Lattice\Ui\Enums\PageLayout;

#[AsPage(
    route: '/products',
    name: 'products.index',
    layout: PageLayout::App,
    container: PageContainer::Default,
    middleware: ['web', 'auth'],
)]
```

## Shared base pages

`layout`, `container`, and `middleware` are inherited: a page that omits one of them takes the nearest
value set by a parent class. Put the shared framing on a base page once, and concrete pages declare
only their own route:

```php
#[AsPage(layout: PageLayout::App, container: PageContainer::Default, middleware: ['web'])]
abstract class AppPage extends Page {}

#[AsPage(route: '/products', name: 'products.index')]
class ProductsPage extends AppPage {} // inherits the App layout, container, and middleware
```

## Layout and container at request time

The attribute sets the layout and container statically. To decide them per request — a different shell
for a guest versus an authenticated user, say — override `layout()` or `container()` on the page.
Returning a non-null value (a `PageLayout`/`PageContainer` case or a registered key) takes precedence
over the attribute; returning `null` defers to it.

```php
public function layout(): PageLayout|string|null
{
    return request()->user() ? PageLayout::App : PageLayout::Auth;
}
```

## Discovery and registration

Lattice scans the paths in `config('lattice.discover')` (your `app/` directory by default) for classes
carrying `#[AsPage]` and registers a route for each one. Register pages that live outside those paths
explicitly:

```php
use Lattice\Lattice\Facades\Lattice;

Lattice::pages([
    ProductsPage::class,
    ProductEditPage::class,
]);
```

Discovery is cached alongside `route:cache`, so the filesystem scan does not run on production
requests.

## Title and breadcrumbs

`title()` sets the document title. `breadcrumbs()` returns the page's trail; a layout's
[`Breadcrumbs`](/core/navigation/#breadcrumbs) component renders whatever the active page provides:

```php
public function breadcrumbs(): array
{
    return [
        ['title' => 'Products', 'href' => '/products'],
        ['title' => 'Edit', 'href' => ''],
    ];
}
```

## Authorization

Override `authorize()` to gate the whole page; it returns `true` by default. A request that fails the
check is rejected before `render()` runs:

```php
use Illuminate\Http\Request;

public function authorize(Request $request): bool
{
    return $request->user()?->can('viewAny', Product::class) ?? false;
}
```

This is the same `authorize()` every Lattice definition carries — see
[Authorization](/core/authorization/) for how it behaves across forms, tables, and actions.
