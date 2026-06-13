<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests;

use Bambamboole\LaravelI18Next\I18NextServiceProvider;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Lattice\Lattice\LatticeServiceProvider;
use Orchestra\Testbench\Concerns\WithLaravelMigrations;
use Orchestra\Testbench\Concerns\WithWorkbench;
use Orchestra\Testbench\TestCase as BaseTestCase;
use Workbench\App\Providers\WorkbenchServiceProvider;

abstract class TestCase extends BaseTestCase
{
    use WithLaravelMigrations;
    use WithWorkbench;

    protected function getEnvironmentSetUp($app): void
    {
        $database = getenv('LATTICE_TEST_DATABASE') ?: sys_get_temp_dir().'/lattice-package-tests/database-'.getmypid().'.sqlite';

        if (! is_dir(dirname($database))) {
            mkdir(dirname($database), 0755, true);
        }

        if (! file_exists($database)) {
            touch($database);
        }

        putenv("LATTICE_TEST_DATABASE={$database}");
        $_ENV['LATTICE_TEST_DATABASE'] = $database;
        $_SERVER['LATTICE_TEST_DATABASE'] = $database;

        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', $database);
        $app['config']->set('inertia.pages.paths', [
            dirname(__DIR__).'/resources/js/pages',
            dirname(__DIR__).'/workbench/resources/js/Pages',
        ]);
        $app['config']->set('inertia.testing.ensure_pages_exist', false);
    }

    /** @return array<int, class-string> */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaServiceProvider::class,
            LatticeServiceProvider::class,
            I18NextServiceProvider::class,
            WorkbenchServiceProvider::class,
        ];
    }

    protected function defineDatabaseMigrations(): void
    {
        $this->loadMigrationsFrom(dirname(__DIR__).'/workbench/database/migrations');
    }
}
