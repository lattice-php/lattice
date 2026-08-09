## Lattice

Lattice (`lattice-php/lattice`) is a server-driven UI layer for Laravel apps running Inertia + React. You describe pages, forms, tables, actions, and menus in **PHP**; Lattice serializes them to a typed component tree that real React components render. The server is the single source of truth — there is no hand-written API and no client-side routing, and the wire format is generated to TypeScript so the two sides cannot drift.

### The model

- A **page** is a PHP class that builds a tree of component definitions; one React component (`lattice/page`) renders it over Inertia by resolving each node against a registry.
- **Forms, tables, actions, and fragments** are PHP classes tagged with an attribute (`#[AsForm]`, `#[AsTable]`, `#[AsAction]`, `#[AsBulkAction]`, `#[AsFragment]`). Lattice **discovers** them under the paths in `config('lattice.discover')` (your `app/` directory by default) and exposes each at a stable, signed endpoint (e.g. `lattice/forms/{form}`, `lattice/tables/{table}`). The rendered components call back into those endpoints for submits, paging, and clicks.

### Building a page

A page extends `Lattice\Http\Page`, returns a `title()`, and builds its UI in `render()`. Annotate it with `#[AsPage(route: '…')]`; Lattice discovers the page and registers its route automatically — no controller, route file entry, or Inertia page component to write by hand.

@verbatim
<code-snippet name="A page and its route" lang="php">
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\PageSchema;
use Lattice\Http\Page as BasePage;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Core\Enums\PageLayout;

#[AsPage(route: '/products', layout: PageLayout::App, middleware: ['web'])]
final class ProductsPage extends BasePage
{
    public function title(): string
    {
        return 'Products';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('page')->gap(Gap::Large)->schema([
                Heading::make('Products'),
                Table::use(ProductsTable::class),
            ]),
        ]);
    }
}

// Discovered automatically; or register explicitly:
// Lattice::pages([ProductsPage::class]);
</code-snippet>
@endverbatim

Drop a form or a table into the tree with `Form::use(MyForm::class)` and `Table::use(MyTable::class)`.

### Building blocks

- **Components** — layout/visual builders in `Lattice\Ui\Components`: `Card`, `Grid`, `Stack`, `Heading`, `Text`, `Tabs`, `Badge`, `Link`, `Button`. Composed into the page tree.
- **Forms** — `FormDefinition` classes with fields + server-side (and live, Precognition) validation. **Reach for the `lattice-forms` skill.**
- **Tables** — `EloquentTableDefinition` classes with columns, sorting, filtering, pagination, and row/bulk actions. **Reach for the `lattice-tables` skill.**
- **Actions** — `ActionDefinition` / `BulkActionDefinition` that run on the server and return effects (toast, redirect, refresh, modal) via `ActionResult`. **Reach for the `lattice-actions` skill.**
- **Navigation** — compose `Menu`/`Sidebar` components inside a layout (there is no route-level sidebar helper).
- **Closures** — most field/action/filter APIs accept `Closure|T`; parameters resolve by name (`$state`, `$get`, `$value`, `$component`, `$search`, …) before type. **Reach for the `lattice-closures` skill.**

### Conventions

- Definitions (forms, tables, actions, pages) live under a discover path (`app/` by default) and follow normal PSR-4 namespacing — e.g. `App\Forms\ProfileForm`, `App\Tables\ProductsTable`. Discovery scans recursively, so the sub-folder is your choice.
- Always give a definition a **stable id** in its attribute: `#[AsForm('app.profile.form')]`. Endpoints and signed refs derive from it; changing it breaks existing references.
- After changing the PHP wire format (enums / value objects) or adding custom components, regenerate the TypeScript types with `php artisan lattice:typescript`.
- Scaffold a page/form/table/action/layout/fragment/remote source with its matching `lattice:*` command below instead of writing the class and attribute by hand. Scaffold **custom** UI (a component, field, or column type of your own) with `lattice:component`/`lattice:field`/`lattice:column` — each generates a paired PHP builder and React `.tsx` component.
- Use Boost's `search-docs` tool for Laravel/Inertia/Pest specifics.

### Artisan commands

| Command | Purpose |
| --- | --- |
| `php artisan lattice:page {name}` | Scaffold a page class. |
| `php artisan lattice:form {name}` | Scaffold a form class. |
| `php artisan lattice:table {name}` | Scaffold a table class. |
| `php artisan lattice:action {name}` | Scaffold an action class. |
| `php artisan lattice:bulk-action {name}` | Scaffold a bulk-action class. |
| `php artisan lattice:layout {name}` | Scaffold a layout class. |
| `php artisan lattice:fragment {name}` | Scaffold a fragment class. |
| `php artisan lattice:remote-source {name}` | Scaffold a remote source class. |
| `php artisan lattice:component {name} {--type=}` | Scaffold a custom Lattice UI component (PHP + React). |
| `php artisan lattice:field {name} {--type=}` | Scaffold a custom form field (PHP + React). |
| `php artisan lattice:column {name} {--type=}` | Scaffold a custom table column (PHP + React). |
| `php artisan lattice:typescript` | Generate Lattice TypeScript types for the current project. |
| `php artisan lattice:discover-cache` | Cache discovered definitions for the configured discover paths. |
| `php artisan lattice:discover-clear` | Clear the discovery cache. |
