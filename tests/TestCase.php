<?php
declare(strict_types=1);

namespace Lattice\Tests;

use Bambamboole\LaravelI18Next\I18NextServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\ParallelTesting;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Lattice\Calendar\CalendarServiceProvider;
use Lattice\Calendar\Components\Calendar;
use Lattice\Chat\ChatServiceProvider;
use Lattice\LatticeServiceProvider;
use Lattice\Map\MapServiceProvider;
use Lattice\Media\MediaServiceProvider;
use Lattice\Pdf\PdfServiceProvider;
use Lattice\Search\SearchServiceProvider;
use Lattice\Support\Testing\InteractsWithLatticeComponents;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeServiceProvider;
use Orchestra\Testbench\Concerns\WithLaravelMigrations;
use Orchestra\Testbench\Concerns\WithWorkbench;
use Orchestra\Testbench\TestCase as BaseTestCase;
use Workbench\App\Providers\WorkbenchServiceProvider;

abstract class TestCase extends BaseTestCase
{
    use InteractsWithLatticeComponents;
    use RefreshDatabase;
    use WithLaravelMigrations;
    use WithWorkbench;

    protected function getEnvironmentSetUp($app): void
    {
        $token = ParallelTesting::token();
        $workspace = sys_get_temp_dir().'/lattice-package-tests/'.basename(dirname(__DIR__));

        if ($token) {
            $database = $workspace.'/database/test_'.$token.'.sqlite';
        } else {
            $database = getenv('LATTICE_TEST_DATABASE') ?: $workspace.'/database-'.getmypid().'.sqlite';
        }

        File::makeDirectory(dirname($database), 0755, true, true);

        if (! file_exists($database)) {
            touch($database);
        }

        putenv("LATTICE_TEST_DATABASE={$database}");
        $_ENV['LATTICE_TEST_DATABASE'] = $database;
        $_SERVER['LATTICE_TEST_DATABASE'] = $database;

        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        // The default manifest cache path (bootstrapPath) lives in the shared
        // Testbench skeleton, so parallel workers would read each other's cache;
        // isolate it per worker process like the database.
        $app['config']->set('lattice.discovery.cache_path', $workspace.'/discovery-manifest-'.getmypid().'.php');
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', $database);
        $app['config']->set('inertia.pages.paths', [
            dirname(__DIR__).'/packages/framework/resources/js/pages',
            dirname(__DIR__).'/workbench/resources/js/Pages',
        ]);
        $app['config']->set('inertia.testing.ensure_pages_exist', false);
    }

    /**
     * @param  \Closure(): Tree  $build
     * @return array<string, mixed>
     */
    public function sealTree(\Closure $build): array
    {
        return $this->sealLatticeComponent($build);
    }

    /**
     * @param  \Closure(): Calendar  $build
     * @return array<string, mixed>
     */
    public function sealCalendar(\Closure $build): array
    {
        return $this->sealLatticeComponent($build);
    }

    /** @return array<int, class-string> */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaServiceProvider::class,
            LatticeServiceProvider::class,
            CalendarServiceProvider::class,
            ChatServiceProvider::class,
            MapServiceProvider::class,
            MediaServiceProvider::class,
            PdfServiceProvider::class,
            SearchServiceProvider::class,
            TreeServiceProvider::class,
            I18NextServiceProvider::class,
            WorkbenchServiceProvider::class,
        ];
    }

    protected function defineDatabaseMigrations(): void
    {
        $this->loadMigrationsFrom(dirname(__DIR__).'/workbench/database/migrations');
    }
}
