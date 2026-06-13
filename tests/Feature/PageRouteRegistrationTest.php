<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page as BasePage;
use Lattice\Lattice\LatticeServiceProvider;

#[Page(layout: PageLayout::App, container: PageContainer::Default)]
abstract class RegBasePage extends BasePage {}

#[Page(route: '/widgets', name: 'widgets.index', middleware: 'web')]
final class RegWidgetsPage extends RegBasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Widgets'));
    }
}

test('Lattice::pages()->all() resolves route metadata for registered pages', function () {
    $widgets = collect(Lattice::pages([RegWidgetsPage::class])->all())
        ->firstWhere('class', RegWidgetsPage::class);

    expect($widgets)->not->toBeNull()
        ->and($widgets->route)->toBe('/widgets')
        ->and($widgets->name)->toBe('widgets.index')
        ->and($widgets->middleware)->toContain('web');
});

test('Lattice::pages()->all() excludes abstract base pages', function () {
    $classes = collect(Lattice::pages([RegBasePage::class])->all())->pluck('class');

    expect($classes)->not->toContain(RegBasePage::class);
});

test('the service provider builds a named GET route for each page', function () {
    Lattice::pages([RegWidgetsPage::class]);

    (new LatticeServiceProvider(app()))->bootPages();

    $route = Route::getRoutes()->getByName('widgets.index');

    expect($route)->not->toBeNull()
        ->and($route->uri())->toBe('widgets')
        ->and($route->getActionName())->toBe(RegWidgetsPage::class.'@render')
        ->and($route->gatherMiddleware())->toContain('web');
});

test('the service provider skips building routes when the route cache is active', function () {
    Lattice::pages([RegWidgetsPage::class]);

    $cachedApp = new class extends Application
    {
        public function __construct() {}

        public function routesAreCached(): bool
        {
            return true;
        }
    };

    (new LatticeServiceProvider($cachedApp))->bootPages();

    expect(Route::getRoutes()->getByName('widgets.index'))->toBeNull();
});
