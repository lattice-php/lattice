<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Spatie\StructureDiscoverer\Cache\DiscoverCacheDriver;
use Spatie\StructureDiscoverer\Cache\LaravelDiscoverCacheDriver;
use Spatie\StructureDiscoverer\Support\DiscoverCacheDriverFactory;

use function Pest\Laravel\artisan;

$fixtures = dirname(__DIR__, 2).'/Fixtures/Discovery';
$cacheId = 'lattice-definitions-'.md5($fixtures);

function discoveryCacheDriver(): DiscoverCacheDriver
{
    return DiscoverCacheDriverFactory::create(
        config('structure-discoverer.cache', ['driver' => LaravelDiscoverCacheDriver::class, 'store' => null]),
    );
}

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

beforeEach(fn () => config()->set('cache.default', 'array'));

afterEach(fn () => discoveryCacheDriver()->forget('lattice-definitions-'.md5(dirname(__DIR__, 2).'/Fixtures/Discovery')));

it('caches and clears definition discovery for the configured paths', function () use ($fixtures, $cacheId) {
    config()->set('lattice.discover', [$fixtures => 'Lattice\\Lattice\\Tests\\Fixtures\\Discovery']);

    $driver = discoveryCacheDriver();
    expect($driver->has($cacheId))->toBeFalse();

    artisan('lattice:discover-cache')->assertSuccessful();
    expect($driver->has($cacheId))->toBeTrue();

    artisan('lattice:discover-clear')->assertSuccessful();
    expect($driver->has($cacheId))->toBeFalse();
});

it('reads discovered classes from the warmed cache instead of walking', function () use ($fixtures, $cacheId) {
    discoveryCacheDriver()->put($cacheId, [DiscoveredProfileForm::class]);

    $result = app(DefinitionDiscovery::class)->discover($fixtures, 'X', discoveryRegistries());

    expect($result['forms'])->toBe([DiscoveredProfileForm::class])
        ->and($result['tables'])->toBe([]);
});

it('walks fresh when the cache is cold', function () use ($fixtures) {
    $result = app(DefinitionDiscovery::class)->discover($fixtures, 'X', discoveryRegistries());

    expect($result['forms'])->toContain(DiscoveredProfileForm::class)
        ->and($result['tables'])->not->toBe([]);
});
