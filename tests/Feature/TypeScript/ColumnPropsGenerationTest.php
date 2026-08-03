<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseProfile.
beforeEach(function (): void {
    app()->bind(TypeScriptProfile::class, AugmentProfile::class);
});

it('writes a ColumnProps augmentation from the column class public props', function (): void {
    $output = base_path('resources/js/lattice/generated-column.d.ts');

    config()->set('lattice.typescript.output', $output);
    config()->set('lattice.typescript.module', '@lattice-php/core');
    config()->set('lattice.discover', [
        dirname(__DIR__, 2).'/Fixtures/TypeScript',
    ]);

    artisan('lattice:typescript')->assertSuccessful();

    $contents = (string) file_get_contents($output);

    expect($contents)
        ->toContain('declare module "@lattice-php/core"')
        ->toContain('interface ComponentProps')
        ->toContain('"field.sample"')
        ->toContain('"sample.widget"')
        ->toContain('interface ColumnProps')
        ->toContain('"column.rating"')
        ->toContain('max: number');

    expect($contents)->not->toMatch('/"column\.rating"\s*:\s*\{[^}]*\bkey:/s');

    File::delete($output);
});
