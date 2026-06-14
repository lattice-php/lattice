<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\LatticeServiceProvider;

use function Pest\Laravel\artisan;

function withPublishedJsScaffold(Closure $callback): mixed
{
    return withScaffoldWorkspace(function () use ($callback): mixed {
        $publishes = ServiceProvider::$publishes;
        $publishGroups = ServiceProvider::$publishGroups;

        $paths = [
            dirname(__DIR__, 3).'/stubs/lattice/plugin.ts' => resource_path('js/lattice/plugin.ts'),
            dirname(__DIR__, 3).'/stubs/lattice/columns.ts' => resource_path('js/lattice/columns.ts'),
        ];

        ServiceProvider::$publishes[LatticeServiceProvider::class] = $paths;
        ServiceProvider::$publishGroups['lattice-js'] = $paths;

        try {
            return $callback();
        } finally {
            ServiceProvider::$publishes = $publishes;
            ServiceProvider::$publishGroups = $publishGroups;
        }
    });
}

it('publishes the JS scaffold under resources/js/lattice', function () {
    withPublishedJsScaffold(function () {
        File::delete(resource_path('js/lattice/plugin.ts'));
        File::delete(resource_path('js/lattice/columns.ts'));

        artisan('vendor:publish', ['--tag' => 'lattice-js', '--force' => true])->assertSuccessful();

        expect(File::exists(resource_path('js/lattice/plugin.ts')))->toBeTrue()
            ->and(File::exists(resource_path('js/lattice/columns.ts')))->toBeTrue()
            ->and(File::get(resource_path('js/lattice/plugin.ts')))->toContain('createPlugin')
            ->and(File::get(resource_path('js/lattice/columns.ts')))->toContain('createPlugin');
    });
});
