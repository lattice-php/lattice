<?php

declare(strict_types=1);

use Lattice\Media\MediaServiceProvider;

it('imports media as an independently installable first-party package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/media';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($package['name'])->toBe('lattice-php/media')
        ->and($package['require'])->toHaveKeys([
            'lattice-php/action',
            'lattice-php/core',
            'lattice-php/form',
            'lattice-php/table',
            'lattice-php/ui',
        ])
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['lattice']['plugin'])->toBe('resources/js/plugin.ts')
        ->and($package['extra']['lattice']['standalone'])->toBe('dist/standalone.js')
        ->and($package['extra']['laravel']['providers'])->toBe([MediaServiceProvider::class])
        ->and($aggregate['require-dev']['lattice-php/media'])->toBe('@dev')
        ->and(new ReflectionClass(MediaServiceProvider::class)->getFileName())->toStartWith($packageRoot.'/src/');
});
