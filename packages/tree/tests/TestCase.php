<?php
declare(strict_types=1);

namespace Lattice\Tree\Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Lattice\Lattice\LatticeServiceProvider;
use Lattice\Lattice\Support\Testing\InteractsWithLatticeComponents;
use Lattice\Tree\TreeServiceProvider;
use Orchestra\Testbench\TestCase as BaseTestCase;
use Workbench\App\WorkbenchConfig;

abstract class TestCase extends BaseTestCase
{
    use InteractsWithLatticeComponents;
    use RefreshDatabase;

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');

        foreach (WorkbenchConfig::lattice() as $key => $value) {
            $app['config']->set($key, $value);
        }
        $app['config']->set('view.paths', [
            ...$app['config']->get('view.paths', []),
            dirname(__DIR__).'/workbench/resources/views',
        ]);
    }

    /** @return array<int, class-string> */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaServiceProvider::class,
            LatticeServiceProvider::class,
            TreeServiceProvider::class,
        ];
    }

    protected function defineDatabaseMigrations(): void
    {
        $this->loadMigrationsFrom(dirname(__DIR__).'/workbench/database/migrations');
    }

    /**
     * @return array<string, mixed>
     */
    public function sealTree(mixed $component): array
    {
        return $this->sealLatticeComponent($component);
    }
}
