<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;

use function Pest\Laravel\artisan;

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

it('walks fresh when the cache is cold', function () {
    discoverFixtures();

    $manifest = app(DiscoveryManifest::class);

    expect($manifest->forGroup('forms'))->toContain(DiscoveredProfileForm::class)
        ->and($manifest->forGroup('tables'))->not->toBe([]);
});
