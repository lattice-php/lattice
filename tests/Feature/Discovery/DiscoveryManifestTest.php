<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;

test('the service provider registers every built-in component group', function (): void {
    expect(DiscoveryKinds::components())->toMatchArray([
        'forms' => AsForm::class,
        'tables' => AsTable::class,
        'actions' => AsAction::class,
        'bulk-actions' => AsBulkAction::class,
        'fragments' => AsFragment::class,
        'layouts' => AsLayout::class,
    ]);
});

test('discovery kinds extracts a component key from its attribute', function (): void {
    expect(DiscoveryKinds::keyOf(DiscoveredProfileForm::class, AsForm::class))
        ->toBe('fixtures.profile');
});

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

use Lattice\Lattice\Forms\Components\Form as FormComponent;

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
