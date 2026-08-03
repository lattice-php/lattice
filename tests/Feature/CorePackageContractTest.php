<?php
declare(strict_types=1);

use Lattice\Lattice\Core\CoreServiceProvider;

it('owns the core backend in an independently installable package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/core';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $providerPath = new ReflectionClass(CoreServiceProvider::class)->getFileName();

    expect($package['name'])->toBe('lattice-php/core')
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['laravel']['providers'])->toBe([CoreServiceProvider::class])
        ->and($aggregate['require']['lattice-php/core'])->toBe('self.version')
        ->and($providerPath)->toStartWith($packageRoot.'/src/');
});
