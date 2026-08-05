<?php
declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Facade;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\CoreServiceProvider;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\LatticeRegistry;
use Lattice\Core\Support\TypeScript\WireFamily;
use Lattice\Form\FormServiceProvider;
use Lattice\Table\TableServiceProvider;
use Lattice\Ui\Components\Component;
use Lattice\Ui\UiServiceProvider;

it('loads domain providers through the umbrella provider', function (): void {
    expect(app()->getProvider(CoreServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(UiServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(FormServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(TableServiceProvider::class))->not->toBeNull();
});

it('registers wire families through the Lattice facade', function (): void {
    Lattice::wireFamily('fixture', AsComponent::class, Component::class, marker: true);

    $families = app(LatticeRegistry::class)->wireFamilies();

    expect($families->keys()->all())->toContain('fixture')
        ->and($families->where('marker', true)->keys()->all())->toContain('fixture')
        ->and($families->get('fixture'))->toBeInstanceOf(WireFamily::class);
});

it('rejects duplicate wire family categories', function (): void {
    Lattice::wireFamily('fixture', AsComponent::class, Component::class, marker: true);

    expect(fn () => Lattice::wireFamily('fixture', AsComponent::class, Component::class, marker: true))
        ->toThrow(InvalidArgumentException::class, 'Wire family [fixture] is already registered.');
});

it('dispatches registered package capabilities and rejects invalid access', function (): void {
    $registry = app(LatticeRegistry::class);
    $registry->registerCapability('fixture', fn (string $value): string => "fixture:{$value}");

    expect($registry->__call('fixture', ['value']))->toBe('fixture:value')
        ->and(fn () => $registry->registerCapability('fixture', fn (): null => null))
        ->toThrow(InvalidArgumentException::class, 'Lattice capability [fixture] is already registered.')
        ->and(fn () => $registry->__call('missingCapability', []))
        ->toThrow(BadMethodCallException::class, 'Lattice capability [missingCapability] is not registered.');
});

it('loads each domain provider with its package dependencies', function (): void {
    $testApplication = Application::getInstance();
    $testFacadeApplication = Facade::getFacadeApplication();

    try {
        foreach ([
            CoreServiceProvider::class => [],
            UiServiceProvider::class => ['component', 'effect'],
            FormServiceProvider::class => ['component', 'effect', 'editor-extension'],
            TableServiceProvider::class => ['component', 'effect', 'editor-extension', 'column', 'filter'],
        ] as $provider => $expectedCategories) {
            $application = new Application;
            Facade::setFacadeApplication($application);
            Lattice::clearResolvedInstance();
            $application->register($provider);

            $registry = $application->make(LatticeRegistry::class);
            $categories = $registry->wireFamilies()->keys()->all();

            expect($categories)->toBe($expectedCategories)
                ->and($application->make(LatticeRegistry::class))->toBe($registry);
        }
    } finally {
        Application::setInstance($testApplication);
        Facade::setFacadeApplication($testFacadeApplication);
        Lattice::clearResolvedInstance();
    }
});
