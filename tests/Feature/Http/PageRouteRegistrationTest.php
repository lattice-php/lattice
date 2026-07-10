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
