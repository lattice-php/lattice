<?php
declare(strict_types=1);

use function Pest\Laravel\artisan;

it('keeps the committed generated.ts in sync with the transformer', function (): void {
    $path = dirname(__DIR__, 3).'/resources/js/types/generated.ts';
    $manifest = dirname(__DIR__, 3).'/resources/js/types/typescript-transformer-manifest.json';

    expect(file_exists($path))->toBeTrue();

    $before = file_get_contents($path);
    $manifestBefore = file_exists($manifest) ? file_get_contents($manifest) : null;

    try {
        artisan('lattice:typescript')->assertSuccessful();

        $after = file_get_contents($path);

        expect($after)->toBe($before);
    } finally {
        file_put_contents($path, $before);
        $manifestBefore === null ? @unlink($manifest) : file_put_contents($manifest, $manifestBefore);
    }
});
