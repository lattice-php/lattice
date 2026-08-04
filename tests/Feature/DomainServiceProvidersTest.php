<?php
declare(strict_types=1);

use Illuminate\Foundation\Application;
use Lattice\Lattice\Actions\ActionsServiceProvider;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\CoreServiceProvider;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Support\TypeScript\WireFamily;
use Lattice\Lattice\Tables\TablesServiceProvider;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\UiServiceProvider;

it('loads domain providers through the umbrella provider', function (): void {
    expect(app()->getProvider(CoreServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(UiServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(FormsServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(ActionsServiceProvider::class))->not->toBeNull()
        ->and(app()->getProvider(TablesServiceProvider::class))->not->toBeNull();
});

it('rejects duplicate wire family categories', function (): void {
    $families = new WireFamilies;
    $family = new WireFamily('component', AsComponent::class, Component::class, marker: true);

    $families->register($family);

    expect(fn () => $families->register($family))
        ->toThrow(InvalidArgumentException::class, 'Wire family [component] is already registered.');
});

it('loads each domain provider with its package dependencies', function (): void {
    $testApplication = Application::getInstance();

    try {
        foreach ([
            CoreServiceProvider::class => [],
            UiServiceProvider::class => ['component', 'effect'],
            FormsServiceProvider::class => ['component', 'effect', 'editor-extension'],
            ActionsServiceProvider::class => ['component', 'effect', 'editor-extension'],
            TablesServiceProvider::class => ['component', 'effect', 'editor-extension', 'column', 'filter'],
        ] as $provider => $expectedCategories) {
            $application = new Application;
            $application->register($provider);

            $categories = array_map(
                static fn (WireFamily $family): string => $family->category,
                $application->make(WireFamilies::class)->all(),
            );

            expect($categories)->toBe($expectedCategories);
        }
    } finally {
        Application::setInstance($testApplication);
    }
});
