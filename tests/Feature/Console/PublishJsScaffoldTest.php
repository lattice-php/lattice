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
            dirname(__DIR__, 3).'/stubs/registry.ts' => resource_path('js/registry.ts'),
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

it('publishes a single registry scaffold to resources/js', function (): void {
    withPublishedJsScaffold(function (): void {
        File::delete(resource_path('js/registry.ts'));

        artisan('vendor:publish', ['--tag' => 'lattice-js', '--force' => true])->assertSuccessful();

        expect(File::exists(resource_path('js/registry.ts')))->toBeTrue()
            ->and(File::get(resource_path('js/registry.ts')))
            ->toContain('extendRegistry')
            ->toContain('components: {}')
            ->toContain('columns: {}');
    });
});
