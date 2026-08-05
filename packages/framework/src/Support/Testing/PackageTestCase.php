<?php

declare(strict_types=1);

namespace Lattice\Support\Testing;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\ServiceProvider;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Lattice\LatticeServiceProvider;
use Orchestra\Testbench\TestCase as BaseTestCase;

use function Orchestra\Testbench\package_path;

/**
 * Base TestCase for Lattice component packages: boots Inertia and Lattice
 * around the package's own providers on an in-memory sqlite app, applies the
 * package's config overrides before boot, and wires the conventional
 * workbench/ view and migration paths when they exist.
 */
abstract class PackageTestCase extends BaseTestCase
{
    use InteractsWithLatticeComponents;
    use RefreshDatabase;

    /**
     * @return array<int, class-string<ServiceProvider>>
     */
    abstract protected function packageProviders(): array;

    /**
     * @return array<string, mixed>
     */
    protected function packageConfig(): array
    {
        return [];
    }

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');

        foreach ($this->packageConfig() as $key => $value) {
            $app['config']->set($key, $value);
        }

        $views = package_path('workbench/resources/views');

        if (is_dir($views)) {
            $app['config']->set('view.paths', [
                ...$app['config']->get('view.paths', []),
                $views,
            ]);
        }
    }

    /**
     * @return array<int, class-string>
     */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaServiceProvider::class,
            LatticeServiceProvider::class,
            ...$this->packageProviders(),
        ];
    }

    protected function defineDatabaseMigrations(): void
    {
        $migrations = package_path('workbench/database/migrations');

        if (is_dir($migrations)) {
            $this->loadMigrationsFrom($migrations);
        }
    }
}
