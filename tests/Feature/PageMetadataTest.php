<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Http\Page as BasePage;
use Lattice\Lattice\Http\PageMetadata;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;

#[Page(layout: PageLayout::App, container: PageContainer::Default)]
abstract class FixtureBasePage extends BasePage {}

#[Page(route: '/products', name: 'products.index')]
final class FixtureProductsPage extends FixtureBasePage {}

#[Page(route: '/products/{product}/edit')]
final class FixtureEditPage extends FixtureBasePage {}

#[Page(route: '/', middleware: 'web')]
final class FixtureHomePage extends FixtureBasePage {}

#[Page(route: '/standalone', container: PageContainer::Centered)]
final class FixtureStandalonePage extends FixtureBasePage {}

test('metadata inherits layout and container from a base page attribute', function () {
    $meta = PageMetadata::for(FixtureProductsPage::class);

    expect($meta->route)->toBe('/products')
        ->and($meta->name)->toBe('products.index')
        ->and($meta->layout)->toBe(PageLayout::App)
        ->and($meta->container)->toBe(PageContainer::Default)
        ->and($meta->middleware)->toBe([]);
});

test('metadata derives the route name when none is given', function () {
    expect(PageMetadata::for(FixtureEditPage::class)->name)->toBe('products.edit');
});

test('metadata falls back to the class name for the root route', function () {
    expect(PageMetadata::for(FixtureHomePage::class)->name)->toBe('fixture-home')
        ->and(PageMetadata::for(FixtureHomePage::class)->middleware)->toBe(['web']);
});

test('a concrete page overrides an inherited container', function () {
    expect(PageMetadata::for(FixtureStandalonePage::class)->container)->toBe(PageContainer::Centered);
});

test('a page without any attribute resolves to defaults', function () {
    $page = new class extends BasePage {};

    $meta = PageMetadata::for($page);

    expect($meta->route)->toBeNull()
        ->and($meta->layout)->toBe(PageLayout::None)
        ->and($meta->container)->toBe(PageContainer::Centered)
        ->and($meta->middleware)->toBe([]);
});

test('page metadata round-trips through an array descriptor', function () {
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

test('for() prefers a manifest descriptor and falls back to reflection', function () {
    config(['lattice.discover' => [
        __DIR__.'/../Fixtures/Discovery' => 'Lattice\\Lattice\\Tests\\Fixtures\\Discovery',
    ]]);

    $manifest = app(DiscoveryManifest::class);
    $manifest->cache();

    try {
        // DiscoveredDemoPage is in the cached manifest.
        $fromManifest = PageMetadata::for(DiscoveredDemoPage::class);
        expect($fromManifest->name)->toBe('discovered.demo');

        // FixtureEditPage is NOT discovered (it lives in this test file) -> reflection fallback.
        $fromReflection = PageMetadata::for(FixtureEditPage::class);
        expect($fromReflection->name)->toBe('products.edit');
    } finally {
        $manifest->clear();
    }
});
