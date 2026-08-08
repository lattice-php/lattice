<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Enums\PageContainer;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\PageMetadata;
use Lattice\Http\Page as BasePage;
use Lattice\LatticeServiceProvider;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

#[AsPage(layout: PageLayout::App, container: PageContainer::Default)]
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

test('Lattice::pageRegistry()->all() resolves route metadata for registered pages', function (): void {
    Lattice::pages([RegWidgetsPage::class]);

    $widgets = collect(Lattice::pageRegistry()->all())
        ->firstWhere('class', RegWidgetsPage::class);

    expect($widgets)->not->toBeNull();
    assert($widgets instanceof PageMetadata);

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

    $route = Route::getRoutes()->getByName('widgets.index');

    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

    expect($route->uri())->toBe('widgets')
        ->and($route->getActionName())->toBe(RegWidgetsPage::class.'@render')
        ->and($route->gatherMiddleware())->toContain('web');
});

test('a page without attribute middleware registers with the configured default', function (): void {
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = Route::getRoutes()->getByName('gadgets.index');
    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

    expect($route->gatherMiddleware())->toBe(['web']);
});

test('the page middleware default is configurable', function (): void {
    config(['lattice.pages.middleware' => ['web', 'auth']]);
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = Route::getRoutes()->getByName('gadgets.index');
    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

    expect($route->gatherMiddleware())->toBe(['web', 'auth']);
});

test('attribute middleware merges after the configured default without duplicates', function (): void {
    config(['lattice.pages.middleware' => ['web']]);
    Lattice::pages([RegWidgetsPage::class, RegAuthPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $authRoute = Route::getRoutes()->getByName('auth.index');
    $widgetsRoute = Route::getRoutes()->getByName('widgets.index');
    expect($authRoute)->not->toBeNull()
        ->and($widgetsRoute)->not->toBeNull();
    assert($authRoute instanceof RoutingRoute);
    assert($widgetsRoute instanceof RoutingRoute);

    expect($authRoute->gatherMiddleware())->toBe(['web', 'auth'])
        ->and($widgetsRoute->gatherMiddleware())->toBe(['web']);
});

test('an empty middleware attribute keeps the configured default', function (): void {
    Lattice::pages([RegBarePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = Route::getRoutes()->getByName('bare.index');
    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

    expect($route->gatherMiddleware())->toBe(['web']);
});

test('a declared ability registers as can middleware after the page middleware', function (): void {
    Lattice::pages([RegGuardedPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = Route::getRoutes()->getByName('guarded.index');
    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

    expect($route->gatherMiddleware())
        ->toBe(['web', 'can:manage-widgets', 'can:inspect-widgets']);
});

test('a page with empty attribute middleware still registers its declared ability after the default', function (): void {
    Lattice::pages([RegGuardedBarePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    $route = Route::getRoutes()->getByName('guarded-bare.index');
    expect($route)->not->toBeNull();
    assert($route instanceof RoutingRoute);

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
