<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;
use Lattice\Core\Facades\Lattice;
use Lattice\Http\Page as BasePage;
use Lattice\LatticeServiceProvider;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

#[AsPage(layout: PageLayout::App, width: PageWidth::Full)]
abstract class RegBasePage extends BasePage {}

#[AsPage(route: '/widgets', name: 'widgets.index', middleware: 'web')]
final class RegWidgetsPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Widgets'));
    }
}

#[AsPage(name: 'registered.embedded')]
final class RegEmbeddedPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Embedded'));
    }
}

#[AsPage(route: '/gadgets', name: 'gadgets.index')]
final class RegGadgetsPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Gadgets'));
    }
}

#[AsPage(route: '/bare', name: 'bare.index', middleware: [])]
final class RegBarePage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Bare'));
    }
}

#[AsPage(route: '/auth', name: 'auth.index', middleware: 'auth')]
final class RegAuthPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Auth'));
    }
}

#[AsPage(route: '/guarded', name: 'guarded.index', can: ['manage-widgets', 'inspect-widgets'])]
final class RegGuardedPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Guarded'));
    }
}

#[AsPage(route: '/guarded-bare', name: 'guarded-bare.index', middleware: [], can: 'manage-widgets')]
final class RegGuardedBarePage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Guarded bare'));
    }
}

#[AsPage(route: '/orders/{order}', name: 'orders.show')]
final class RegOrdersShowPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Order'));
    }
}

#[AsPage(route: '/orders/create', name: 'orders.create')]
final class RegOrdersCreatePage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Create order'));
    }
}

#[AsPage(route: '/orders/{order}/edit', name: 'orders.edit')]
final class RegOrdersEditPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Edit order'));
    }
}

#[AsPage(route: '/orders/bulk/{action}', name: 'orders.bulk')]
final class RegOrdersBulkPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Bulk orders'));
    }
}

test('Lattice::pageRegistry()->all() resolves route metadata for registered pages', function (): void {
    Lattice::pages([RegWidgetsPage::class]);

    $widgets = collect(Lattice::pageRegistry()->all())
        ->firstOrFail('class', RegWidgetsPage::class);

    expect($widgets->route)->toBe('/widgets')
        ->and($widgets->name)->toBe('widgets.index')
        ->and($widgets->middleware)->toContain('web');
});

test('Lattice::pageRegistry()->all() excludes abstract base pages', function (): void {
    Lattice::pages([RegBasePage::class]);

    $classes = collect(Lattice::pageRegistry()->all())->pluck('class');

    expect($classes)->not->toContain(RegBasePage::class);
});

test('the service provider builds a named GET route for each page', function (): void {
    Lattice::pages([RegWidgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('widgets.index');

    expect($route->uri())->toBe('widgets')
        ->and($route->getActionName())->toBe(RegWidgetsPage::class.'@render')
        ->and($route->gatherMiddleware())->toContain('web');
});

test('a page without attribute middleware registers with the configured default', function (): void {
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('gadgets.index');

    expect($route->gatherMiddleware())->toBe(['web']);
});

test('the page middleware default is configurable', function (): void {
    config(['lattice.pages.middleware' => ['web', 'auth']]);
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('gadgets.index');

    expect($route->gatherMiddleware())->toBe(['web', 'auth']);
});

test('attribute middleware merges after the configured default without duplicates', function (): void {
    config(['lattice.pages.middleware' => ['web']]);
    Lattice::pages([RegWidgetsPage::class, RegAuthPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $authRoute = namedRoute('auth.index');
    $widgetsRoute = namedRoute('widgets.index');

    expect($authRoute->gatherMiddleware())->toBe(['web', 'auth'])
        ->and($widgetsRoute->gatherMiddleware())->toBe(['web']);
});

test('an empty middleware attribute keeps the configured default', function (): void {
    Lattice::pages([RegBarePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('bare.index');

    expect($route->gatherMiddleware())->toBe(['web']);
});

test('a declared ability registers as can middleware after the page middleware', function (): void {
    Lattice::pages([RegGuardedPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('guarded.index');

    expect($route->gatherMiddleware())
        ->toBe(['web', 'can:manage-widgets', 'can:inspect-widgets']);
});

test('a page with empty attribute middleware still registers its declared ability after the default', function (): void {
    Lattice::pages([RegGuardedBarePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = namedRoute('guarded-bare.index');

    expect($route->gatherMiddleware())
        ->toBe(['web', 'can:manage-widgets']);
});

test('an imperatively registered route-less page registers no route, while a routed sibling still gets its route', function (): void {
    Lattice::pages([RegWidgetsPage::class, RegEmbeddedPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $actions = collect(Route::getRoutes()->getRoutes())->map(fn ($route) => $route->getActionName());

    expect(collect(Lattice::pageRegistry()->all())->pluck('class'))->toContain(RegEmbeddedPage::class)
        ->and($actions)->not->toContain(RegEmbeddedPage::class.'@render')
        ->and(Route::getRoutes()->getByName('widgets.index'))->not->toBeNull();
});

test('a static route wins over a parameterised sibling registered before it', function (): void {
    Lattice::pages([RegOrdersShowPage::class, RegOrdersCreatePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $matched = Route::getRoutes()->match(Request::create('/orders/create'));

    expect($matched->getActionName())->toBe(RegOrdersCreatePage::class.'@render');
});

test('a route with an earlier static segment wins over one whose parameter would swallow it', function (): void {
    Lattice::pages([RegOrdersEditPage::class, RegOrdersBulkPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $matched = Route::getRoutes()->match(Request::create('/orders/bulk/edit'));

    expect($matched->getActionName())->toBe(RegOrdersBulkPage::class.'@render');
});

test('the service provider skips building routes when the route cache is active', function (): void {
    Lattice::pages([RegWidgetsPage::class]);

    $cachedApp = new class extends Application
    {
        public function __construct() {}

        public function routesAreCached(): bool
        {
            return true;
        }
    };

    new LatticeServiceProvider($cachedApp)->bootPages();

    expect(Route::getRoutes()->getByName('widgets.index'))->toBeNull();
});
