<?php
declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseProfile.
beforeEach(function () {
    app()->bind(TypeScriptProfile::class, AugmentProfile::class);
});

it('writes an augmentation file for app components, not built-ins', function () {
    withScaffoldWorkspace(function () {
        $output = base_path('resources/js/lattice/generated.d.ts');

        config()->set('lattice.typescript.output', $output);
        config()->set('lattice.typescript.module', '@lattice-php/lattice');
        config()->set('lattice.discover', [
            dirname(__DIR__, 2).'/Fixtures/TypeScript',
        ]);

        artisan('lattice:typescript')->assertSuccessful();

        $contents = file_get_contents($output);

        expect($contents)
            ->toBeString()
            ->toContain('declare module "@lattice-php/lattice"')
            ->toContain('interface ComponentProps')
            ->toContain('"sample.field"')
            ->toContain('"sample.widget"')
            ->toContain('"sample.field": {')
            ->toContain('name: string')
            ->toContain('label: string | null');

        expect(is_string($contents) && str_contains($contents, '"badge"'))->toBeFalse();
    });
});

it('produces a valid augmentation file even when discover config is empty', function () {
    withScaffoldWorkspace(function () {
        $output = base_path('resources/js/lattice/generated-empty.d.ts');

        config()->set('lattice.typescript.output', $output);
        config()->set('lattice.typescript.module', '@lattice-php/lattice');
        config()->set('lattice.discover', []);

        artisan('lattice:typescript')->assertSuccessful();

        $contents = file_get_contents($output);

        expect($contents)
            ->toBeString()
            ->toContain('declare module "@lattice-php/lattice"')
            ->toContain('interface ComponentProps {')
            ->toContain('export {};');
    });
});
