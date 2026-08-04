<?php

declare(strict_types=1);

use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Http\LatticeResponse;
use Lattice\Lattice\Http\SubRequest;
use Lattice\Lattice\LatticeRegistry;

it('owns the form backend in an independently installable package', function (): void {
    $root = dirname(__DIR__, 2);
    $packageRoot = $root.'/packages/form';
    $package = json_decode((string) file_get_contents($packageRoot.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $aggregate = json_decode((string) file_get_contents($root.'/composer.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($package['name'])->toBe('lattice-php/form')
        ->and($package['require']['lattice-php/core'])->toBe('self.version')
        ->and($package['require']['lattice-php/ui'])->toBe('self.version')
        ->and($package['require'])->not->toHaveKey('lattice-php/lattice')
        ->and($package['extra']['laravel']['providers'])->toBe([FormsServiceProvider::class])
        ->and($aggregate['require']['lattice-php/form'])->toBe('self.version')
        ->and(new ReflectionClass(FormsServiceProvider::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(FormDefinition::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(SubRequest::class)->getFileName())->toStartWith($packageRoot.'/src/')
        ->and(new ReflectionClass(Evaluate::class)->getFileName())->toStartWith($root.'/packages/core/src/')
        ->and(app(LatticeRegistry::class)->wireSources())->toContain(realpath($packageRoot.'/src'));
});

it('keeps the form package independent from aggregate domains', function (): void {
    $packageRoot = dirname(__DIR__, 2).'/packages/form/src';
    $forbidden = [
        'Lattice\\Lattice\\Actions',
        'Lattice\\Lattice\\Tables',
        'Lattice\\Lattice\\Effects\\Builtin',
        LatticeResponse::class,
        'Lattice\\Lattice\\I18n',
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
