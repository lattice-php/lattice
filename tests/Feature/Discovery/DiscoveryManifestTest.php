<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Support\Discovery\ClassWalker;
use Lattice\LatticeServiceProvider;
use Lattice\Table\Columns\BadgeColumn;
use Lattice\Table\Enums\ColumnType;
use Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;
use Lattice\Tests\Fixtures\Discovery\DiscoveredEmbeddedPage;
use Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;

test('the manifest builds resolved entries for every kind', function (): void {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);

    expect($manifest->forGroup('forms'))->toMatchArray(['fixtures.profile' => DiscoveredProfileForm::class])
        ->and($manifest->forGroup('tables'))->toMatchArray(['fixtures.users' => DiscoveredUsersTable::class])
        ->and(collect($manifest->pageDescriptors())->firstWhere('class', DiscoveredDemoPage::class))
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']]);
});

test('the manifest indexes page descriptors by class', function (): void {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);
    $resolved = $manifest->resolve();

    expect($resolved['pages'])->toHaveKey(DiscoveredDemoPage::class)
        ->and($resolved['pages'][DiscoveredDemoPage::class])
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']])
        ->and($manifest->descriptorFor(DiscoveredDemoPage::class))
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']]);
});

test('the manifest round-trips through the cached file', function (): void {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);
    $manifest->cache();

    try {
        expect($manifest->isCached())->toBeTrue();

        $fresh = new DiscoveryManifest(app(), app('files'));
        expect($fresh->forGroup('forms'))->toMatchArray(['fixtures.profile' => DiscoveredProfileForm::class])
            ->and($fresh->descriptorFor(DiscoveredDemoPage::class))
            ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']]);
    } finally {
        $manifest->clear();
        expect($manifest->isCached())->toBeFalse();
    }
});

use Lattice\Form\Components\Form as FormComponent;

test('registries resolve discovered definitions from the manifest', function (): void {
    discoverFixtures();

    // No explicit Lattice::forms([...]) — resolution comes from the manifest.
    $form = wire(FormComponent::use(DiscoveredProfileForm::class));

    expect($form)->toMatchArray(['type' => 'form', 'id' => 'fixtures.profile']);
});

test('discovered pages are available through the page registry', function (): void {
    discoverFixtures();

    $classes = collect(Lattice::pageRegistry()->all())->pluck('class');

    expect($classes)->toContain(DiscoveredDemoPage::class);
});

test('a discovered route-less page registers no route, while a routed sibling still gets its route', function (): void {
    discoverFixtures();

    new LatticeServiceProvider(app())->bootPages();

    $actions = collect(Route::getRoutes()->getRoutes())->map(fn ($route) => $route->getActionName());

    expect(collect(Lattice::pageRegistry()->all())->pluck('class'))->toContain(DiscoveredEmbeddedPage::class)
        ->and($actions)->not->toContain(DiscoveredEmbeddedPage::class.'@render')
        ->and(Route::getRoutes()->getByName('discovered.demo'))->not->toBeNull();
});

test('the class walker returns classes under a path and an empty list for a missing path', function (): void {
    expect(ClassWalker::classes(dirname(__DIR__, 3).'/packages/table/src/Columns'))->toContain(BadgeColumn::class)
        ->and(ClassWalker::classes('/no/such/path'))->toBe([]);
});

test('the class walker includes enums via all()', function (): void {
    expect(ClassWalker::all(dirname(__DIR__, 3).'/packages/table/src/Enums'))->toContain(ColumnType::class);
});

test('the manifest skips a class that fails to autoload instead of throwing', function (): void {
    config(['lattice.discover' => [
        dirname(__DIR__, 2).'/Fixtures/Discovery',
        dirname(__DIR__, 2).'/Fixtures/TypeScript/Unloadable',
    ]]);
    app(DiscoveryManifest::class)->clear();

    $manifest = app(DiscoveryManifest::class);

    expect($manifest->forGroup('forms'))->toMatchArray(['fixtures.profile' => DiscoveredProfileForm::class]);
});
