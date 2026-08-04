<?php

declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TablesServiceProvider;

it('owns the table backend in an independently installable package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/table';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($package['name'])->toBe('lattice-php/table')
        ->and($package['require']['lattice-php/core'])->toBe('self.version')
        ->and($package['require']['lattice-php/form'])->toBe('self.version')
        ->and($package['require']['lattice-php/ui'])->toBe('self.version')
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['laravel']['providers'])->toBe([TablesServiceProvider::class])
        ->and($aggregate['require']['lattice-php/table'])->toBe('self.version')
        ->and(new ReflectionClass(TablesServiceProvider::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(TableDefinition::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(app(WireFamilies::class)->sources())->toContain(realpath($packageRoot.'/src'));
});

it('keeps the table package independent from aggregate domains', function (): void {
    $packageRoot = dirname(__DIR__, 2).'/packages/table/src';
    $forbidden = [
        'Lattice\\Lattice\\Actions',
        'Lattice\\Lattice\\Fragments',
        'Lattice\\Lattice\\Layouts',
        'Lattice\\Lattice\\Http\\Controllers',
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
