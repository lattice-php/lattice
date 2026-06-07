<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests;

use Bambamboole\Lattice\LatticeServiceProvider;
use Inertia\ServiceProvider as InertiaServiceProvider;
use Orchestra\Testbench\Concerns\WithWorkbench;
use Orchestra\Testbench\TestCase as BaseTestCase;
use Workbench\App\Providers\WorkbenchServiceProvider;

abstract class TestCase extends BaseTestCase
{
    use WithWorkbench;

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app['config']->set('inertia.pages.paths', [
            dirname(__DIR__).'/resources/js/pages',
            dirname(__DIR__).'/workbench/resources/js/Pages',
        ]);
    }

    /** @return array<int, class-string> */
    protected function getPackageProviders($app): array
    {
        return [
            InertiaServiceProvider::class,
            LatticeServiceProvider::class,
            WorkbenchServiceProvider::class,
        ];
    }
}
