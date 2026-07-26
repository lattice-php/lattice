<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page as BasePage;
use Lattice\Lattice\LatticeServiceProvider;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\PageContainer;
use Lattice\Lattice\Ui\Enums\PageLayout;

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

test('Lattice::pageRegistry()->all() resolves route metadata for registered pages', function (): void {
    Lattice::pages([RegWidgetsPage::class]);

    $widgets = collect(Lattice::pageRegistry()->all())
        ->firstWhere('class', RegWidgetsPage::class);

    expect($widgets)->not->toBeNull()
        ->and($widgets->route)->toBe('/widgets')
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

    expect($route)->not->toBeNull()
        ->and($route->uri())->toBe('widgets')
        ->and($route->getActionName())->toBe(RegWidgetsPage::class.'@render')
        ->and($route->gatherMiddleware())->toContain('web');
});

test('a page without attribute middleware registers with the configured default', function (): void {
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    expect(Route::getRoutes()->getByName('gadgets.index')->gatherMiddleware())->toBe(['web']);
});

test('the page middleware default is configurable', function (): void {
    config(['lattice.pages.middleware' => ['web', 'auth']]);
    Lattice::pages([RegGadgetsPage::class]);

    new LatticeServiceProvider(app())->bootPages();

    expect(Route::getRoutes()->getByName('gadgets.index')->gatherMiddleware())->toBe(['web', 'auth']);
});

test('an explicit empty middleware attribute opts the page out of the default', function (): void {
    Lattice::pages([RegBarePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    expect(Route::getRoutes()->getByName('bare.index')->gatherMiddleware())->toBe([]);
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
