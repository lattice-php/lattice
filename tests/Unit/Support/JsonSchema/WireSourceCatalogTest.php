<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\WireSourceCatalog;

it('discovers wire sources from installed packages with discover dirs', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [['name' => 'lattice-php/table', 'install-path' => '../lattice-php/table',
            'extra' => ['lattice' => ['discover' => ['src']]]]],
        rootComposer: ['name' => 'acme/app'],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    $sources = $catalog->discover();

    expect($sources)->toHaveCount(1)
        ->and($sources[0]->composerName)->toBe('lattice-php/table')
        ->and($sources[0]->shortName)->toBe('table')
        ->and($sources[0]->schemaId())->toBe('https://lattice-php.dev/schema/table/v1.json');
});

it('appends the root package as a source when it declares discover dirs', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [],
        rootComposer: ['name' => 'acme/app', 'extra' => ['lattice' => ['discover' => ['app']]]],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    $sources = $catalog->discover();

    expect($sources)->toHaveCount(1)
        ->and($sources[0]->isRoot)->toBeTrue()
        ->and($sources[0]->composerName)->toBe('acme/app')
        ->and($sources[0]->shortName)->toBe('app')
        ->and($sources[0]->packageDir)->toBe('/repo')
        ->and($sources[0]->dirs)->toBe(['/repo/app']);
});

it('maps lattice-php/lattice to short name lattice', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [['name' => 'lattice-php/lattice', 'install-path' => '../lattice-php/lattice',
            'extra' => ['lattice' => ['discover' => ['src']]]]],
        rootComposer: [],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    expect($catalog->discover()[0]->shortName)->toBe('lattice');
});

it('resolves the origin of a class file by longest dir prefix', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [
            ['name' => 'lattice-php/core', 'install-path' => '../lattice-php/core',
                'extra' => ['lattice' => ['discover' => ['src']]]],
            ['name' => 'lattice-php/table', 'install-path' => '../lattice-php/table',
                'extra' => ['lattice' => ['discover' => ['src']]]],
        ],
        rootComposer: [],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    $tableDir = '/repo/vendor/composer/../lattice-php/table/src';
    $origin = $catalog->originOf($tableDir.'/Components/Table.php');

    expect($origin?->composerName)->toBe('lattice-php/table');
});

it('returns null when no source dir prefixes the class file', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [['name' => 'lattice-php/table', 'install-path' => '../lattice-php/table',
            'extra' => ['lattice' => ['discover' => ['src']]]]],
        rootComposer: [],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    expect($catalog->originOf('/somewhere/else/Foo.php'))->toBeNull();
});

it('ignores installed packages without discover dirs', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [['name' => 'lattice-php/media', 'install-path' => '../lattice-php/media', 'extra' => []]],
        rootComposer: [],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    expect($catalog->discover())->toBe([]);
});

it('ignores the root package when it has no discover dirs', function (): void {
    $catalog = new WireSourceCatalog(
        installed: [],
        rootComposer: ['name' => 'acme/app'],
        composerDir: '/repo/vendor/composer',
        rootDir: '/repo',
    );

    expect($catalog->discover())->toBe([]);
});
