<?php
declare(strict_types=1);

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Support\TypeScript\TypeScriptProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseProfile.
beforeEach(function (): void {
    app()->bind(TypeScriptProfile::class, AugmentProfile::class);
});

it('fails with a clear message when discovery resolves to zero app components', function (): void {
    $output = sys_get_temp_dir().'/lattice-package-tests/typescript-empty-'.getmypid().'.d.ts';
    $emptyDir = sys_get_temp_dir().'/lattice-package-tests/typescript-empty-dir-'.getmypid();

    File::ensureDirectoryExists($emptyDir);

    config()->set('lattice.discover', [$emptyDir]);
    config()->set('lattice.typescript.output', $output);
    config()->set('lattice.typescript.module', '@lattice-php/core');

    $exitCode = Artisan::call('lattice:typescript');
    $message = Artisan::output();

    expect($exitCode)->toBe(Command::FAILURE)
        ->and($message)->toContain('No app components were discovered')
        ->and($message)->toContain('extra.lattice.discover')
        ->and($message)->toContain($emptyDir)
        ->and(File::exists($output))->toBeFalse();

    File::deleteDirectory($emptyDir);
});

it('falls back to config(lattice.discover) and generates when the composer key is absent', function (): void {
    $output = sys_get_temp_dir().'/lattice-package-tests/typescript-fallback-'.getmypid().'.d.ts';

    config()->set('lattice.discover', [dirname(__DIR__, 2).'/Fixtures/TypeScript']);
    config()->set('lattice.typescript.output', $output);
    config()->set('lattice.typescript.module', '@lattice-php/core');

    artisan('lattice:typescript')->assertSuccessful();

    expect(File::get($output))
        ->toContain('declare module "@lattice-php/core"')
        ->toContain('"field.sample"');

    File::delete($output);
});
