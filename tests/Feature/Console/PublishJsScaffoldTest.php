<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('publishes the JS scaffold under resources/js/lattice', function () {
    File::delete(resource_path('js/lattice/plugin.ts'));
    File::delete(resource_path('js/lattice/columns.ts'));

    artisan('vendor:publish', ['--tag' => 'lattice-js', '--force' => true])->assertSuccessful();

    expect(File::exists(resource_path('js/lattice/plugin.ts')))->toBeTrue()
        ->and(File::exists(resource_path('js/lattice/columns.ts')))->toBeTrue()
        ->and(File::get(resource_path('js/lattice/plugin.ts')))->toContain('createPlugin')
        ->and(File::get(resource_path('js/lattice/columns.ts')))->toContain('createPlugin');

    // cleanup so the testbench skeleton / worktree is not left dirty
    File::delete(resource_path('js/lattice/plugin.ts'));
    File::delete(resource_path('js/lattice/columns.ts'));
});
