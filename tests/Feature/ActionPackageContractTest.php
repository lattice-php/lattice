<?php

declare(strict_types=1);

use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionsServiceProvider;
use Lattice\Lattice\Support\TypeScript\WireFamilies;

it('owns the action backend in an independently installable package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/action';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($package['name'])->toBe('lattice-php/action')
        ->and($package['require']['lattice-php/core'])->toBe('self.version')
        ->and($package['require']['lattice-php/form'])->toBe('self.version')
        ->and($package['require']['lattice-php/ui'])->toBe('self.version')
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['laravel']['providers'])->toBe([ActionsServiceProvider::class])
        ->and($aggregate['require']['lattice-php/action'])->toBe('self.version')
        ->and(new ReflectionClass(ActionsServiceProvider::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(ActionDefinition::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(app(WireFamilies::class)->sources())->toContain(realpath($packageRoot.'/src'));
});

it('keeps the action package independent from aggregate domains', function (): void {
    $packageRoot = dirname(__DIR__, 2).'/packages/action/src';
    $forbidden = [
        'Lattice\\Lattice\\Facades',
        'Lattice\\Lattice\\Fragments',
        'Lattice\\Lattice\\Http\\Controllers',
        'Lattice\\Lattice\\Layouts',
        'Lattice\\Lattice\\Notifications',
        'Lattice\\Lattice\\Tables',
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
