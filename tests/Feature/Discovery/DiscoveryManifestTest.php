<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Attributes\BulkAction;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredDemoPage;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;

test('discovery kinds map every component group to its attribute', function () {
    expect(DiscoveryKinds::COMPONENTS)->toMatchArray([
        'forms' => Form::class,
        'tables' => Table::class,
        'actions' => Action::class,
        'bulk-actions' => BulkAction::class,
        'fragments' => Fragment::class,
        'layouts' => Layout::class,
    ]);
});

test('discovery kinds extracts a component key from its attribute', function () {
    expect(DiscoveryKinds::keyOf(DiscoveredProfileForm::class, Form::class))
        ->toBe('fixtures.profile');
});

test('the manifest builds resolved entries for every kind', function () {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);

    expect($manifest->forGroup('forms'))->toMatchArray(['fixtures.profile' => DiscoveredProfileForm::class])
        ->and($manifest->forGroup('tables'))->toMatchArray(['fixtures.users' => DiscoveredUsersTable::class])
        ->and(collect($manifest->pageDescriptors())->firstWhere('class', DiscoveredDemoPage::class))
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']]);
});

test('the manifest indexes page descriptors by class', function () {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);
    $resolved = $manifest->resolve();

    expect($resolved['pages'])->toHaveKey(DiscoveredDemoPage::class)
        ->and($resolved['pages'][DiscoveredDemoPage::class])
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']])
        ->and($manifest->descriptorFor(DiscoveredDemoPage::class))
        ->toMatchArray(['route' => '/discovered-demo', 'name' => 'discovered.demo', 'middleware' => ['web']]);
});

test('the manifest round-trips through the cached file', function () {
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

test('registries resolve discovered definitions from the manifest', function () {
    discoverFixtures();

    // No explicit Lattice::forms([...]) — resolution comes from the manifest.
    $form = wire(FormComponent::use(DiscoveredProfileForm::class));

    expect($form)->toMatchArray(['type' => 'form', 'id' => 'fixtures.profile']);
});

test('discovered pages are available through the page registry', function () {
    discoverFixtures();

    $classes = collect(Lattice::pages()->all())->pluck('class');

    expect($classes)->toContain(DiscoveredDemoPage::class);
});
