<?php

declare(strict_types=1);

use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Enums\PageContainer;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\PageMetadata;
use Lattice\Http\Page as BasePage;
use Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;

#[AsPage(layout: PageLayout::App, container: PageContainer::Default)]
abstract class FixtureBasePage extends BasePage {}

#[AsPage(route: '/products', name: 'products.index')]
final class FixtureProductsPage extends FixtureBasePage {}

#[AsPage(route: '/products/{product}/edit')]
final class FixtureEditPage extends FixtureBasePage {}

#[AsPage(route: '/', middleware: 'web')]
final class FixtureHomePage extends FixtureBasePage {}

#[AsPage(route: '/standalone', container: PageContainer::Centered)]
final class FixtureStandalonePage extends FixtureBasePage {}

#[AsPage(route: '/guarded', can: 'manage-widgets')]
final class FixtureGuardedPage extends FixtureBasePage {}

test('metadata inherits layout and container from a base AsPage attribute', function (): void {
    $meta = PageMetadata::for(FixtureProductsPage::class);

    expect($meta->route)->toBe('/products')
        ->and($meta->name)->toBe('products.index')
        ->and($meta->layout)->toBe(PageLayout::App)
        ->and($meta->container)->toBe(PageContainer::Default)
        ->and($meta->middleware)->toBeNull();
});

test('metadata derives the route name when none is given', function (): void {
    expect(PageMetadata::for(FixtureEditPage::class)->name)->toBe('products.edit');
});

test('metadata falls back to the class name for the root route', function (): void {
    expect(PageMetadata::for(FixtureHomePage::class)->name)->toBe('fixture-home')
        ->and(PageMetadata::for(FixtureHomePage::class)->middleware)->toBe(['web']);
});

test('a concrete page overrides an inherited container', function (): void {
    expect(PageMetadata::for(FixtureStandalonePage::class)->container)->toBe(PageContainer::Centered);
});

test('a page without any attribute resolves to defaults', function (): void {
    $page = new class extends BasePage {};

    $meta = PageMetadata::for($page);

    expect($meta->route)->toBeNull()
        ->and($meta->layout)->toBe(PageLayout::None)
        ->and($meta->container)->toBe(PageContainer::Centered)
        ->and($meta->middleware)->toBeNull();
});

test('page metadata round-trips through an array descriptor', function (): void {
    $descriptor = PageMetadata::reflect(FixtureEditPage::class)->toArray();

    expect($descriptor)->toMatchArray([
        'class' => FixtureEditPage::class,
        'route' => '/products/{product}/edit',
        'name' => 'products.edit',
        'layout' => 'app',
        'container' => 'default',
    ]);

    $rebuilt = PageMetadata::fromArray($descriptor);

    expect($rebuilt->class)->toBe(FixtureEditPage::class)
        ->and($rebuilt->route)->toBe('/products/{product}/edit')
        ->and($rebuilt->layout)->toBe('app')
        ->and($rebuilt->container)->toBe('default');
});

test('a declared ability round-trips through the descriptor', function (): void {
    $descriptor = PageMetadata::reflect(FixtureGuardedPage::class)->toArray();

    expect($descriptor['can'])->toBe(['manage-widgets'])
        ->and(PageMetadata::fromArray($descriptor)->can)->toBe(['manage-widgets']);
});

test('a descriptor cached before can existed defaults to no abilities', function (): void {
    $descriptor = PageMetadata::reflect(FixtureEditPage::class)->toArray();
    unset($descriptor['can']);

    expect(PageMetadata::fromArray($descriptor)->can)->toBe([]);
});

test('for() prefers a manifest descriptor and falls back to reflection', function (): void {
    config(['lattice.discover' => [
        __DIR__.'/../Fixtures/Discovery',
    ]]);

    $manifest = app(DiscoveryManifest::class);
    $manifest->cache();

    try {
        $fromCachedManifest = PageMetadata::for(DiscoveredDemoPage::class);
        expect($fromCachedManifest->name)->toBe('discovered.demo');

        $fromReflectionFallback = PageMetadata::for(FixtureEditPage::class);
        expect($fromReflectionFallback->name)->toBe('products.edit');
    } finally {
        $manifest->clear();
    }
});
