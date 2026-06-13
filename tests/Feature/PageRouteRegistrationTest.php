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

#[Page(route: '/cache-guard', name: 'cache-guard.page')]
final class RegCacheGuardPage extends BasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Cache guard'));
    }
}

test('registering a page binds a named GET route to render', function () {
    Lattice::pages([RegWidgetsPage::class]);

    $route = Route::getRoutes()->getByName('widgets.index');

    expect($route)->not->toBeNull()
        ->and($route->uri())->toBe('widgets')
        ->and($route->getActionName())->toBe(RegWidgetsPage::class.'@render')
        ->and($route->gatherMiddleware())->toContain('web');
});

test('an abstract base page is never registered as a route', function () {
    Lattice::pages([RegBasePage::class]);

    $names = collect(Route::getRoutes()->getRoutes())->map->getActionName();

    expect($names)->not->toContain(RegBasePage::class.'@render');
});

test('configured page routes register when the route cache is inactive', function () {
    config(['lattice.pages.registered' => [RegCacheGuardPage::class]]);

    expect(app()->routesAreCached())->toBeFalse();

    (new LatticeServiceProvider(app()))->bootPages();

    expect(Route::getRoutes()->getByName('cache-guard.page'))->not->toBeNull();
});

test('page route registration is skipped when the route cache is active', function () {
    config(['lattice.pages.registered' => [RegCacheGuardPage::class]]);

    $cachedApp = new class extends Application
    {
        public function __construct() {}

        public function routesAreCached(): bool
        {
            return true;
        }
    };

    (new LatticeServiceProvider($cachedApp))->bootPages();

    expect(Route::getRoutes()->getByName('cache-guard.page'))->toBeNull();
});
