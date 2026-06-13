<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;

use function Pest\Laravel\artisan;

$fixtures = dirname(__DIR__, 2).'/Fixtures/Discovery';

/** @return array<int, DefinitionRegistry<*>> */
function discoveryRegistries(): array
{
    return [
        app(FormRegistry::class),
        app(TableRegistry::class),
        app(ActionRegistry::class),
        app(FragmentRegistry::class),
        app(BulkActionRegistry::class),
        app(LayoutRegistry::class),
    ];
}

afterEach(function () {
    app(DiscoveryManifest::class)->clear();
});

it('caches and clears the discovery manifest', function () {
    $manifest = app(DiscoveryManifest::class);

    expect($manifest->isCached())->toBeFalse();

    artisan('lattice:discover-cache')->assertSuccessful();
    expect($manifest->isCached())->toBeTrue();

    artisan('lattice:discover-clear')->assertSuccessful();
    expect($manifest->isCached())->toBeFalse();
});

it('walks fresh when the cache is cold', function () use ($fixtures) {
    $result = app(DefinitionDiscovery::class)->discover($fixtures, 'X', discoveryRegistries());

    expect($result['forms'])->toContain(DiscoveredProfileForm::class)
        ->and($result['tables'])->not->toBe([]);
});
