<?php

declare(strict_types=1);

use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Ui\UiServiceProvider;

it('owns the ui backend in an independently installable package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/ui';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($package['name'])->toBe('lattice-php/ui')
        ->and($package['require']['lattice-php/core'])->toBe('self.version')
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['laravel']['providers'])->toBe([UiServiceProvider::class])
        ->and($aggregate['require']['lattice-php/ui'])->toBe('self.version')
        ->and(new ReflectionClass(UiServiceProvider::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(Effect::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(app(WireFamilies::class)->sources())->toContain(realpath($packageRoot.'/src'));
});

it('keeps the ui package independent from aggregate domains', function (): void {
    $packageRoot = dirname(__DIR__, 2).'/packages/ui/src';
    $forbidden = [
        'Lattice\\Lattice\\Actions',
        'Lattice\\Lattice\\Forms',
        'Lattice\\Lattice\\Tables',
        'Lattice\\Lattice\\Http',
        'Lattice\\Lattice\\Facades',
    ];
    $violations = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($packageRoot)) as $file) {
        if (! $file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }

        $contents = (string) file_get_contents($file->getPathname());

        foreach ($forbidden as $namespace) {
            if (str_contains($contents, $namespace)) {
                $violations[] = $file->getFilename().': '.$namespace;
            }
        }
    }

    expect($violations)->toBeEmpty();
});
