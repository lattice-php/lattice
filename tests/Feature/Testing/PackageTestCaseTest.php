<?php
declare(strict_types=1);

use Inertia\ServiceProvider as InertiaServiceProvider;
use Lattice\LatticeServiceProvider;
use Lattice\Support\Testing\PackageTestCase;
use Workbench\App\Providers\WorkbenchServiceProvider;

use function Orchestra\Testbench\package_path;

function fakePackageTestCase(): PackageTestCase
{
    return new class('noop') extends PackageTestCase
    {
        protected function packageProviders(): array
        {
            return [WorkbenchServiceProvider::class];
        }

        protected function packageConfig(): array
        {
            return ['lattice.i18n.locales' => ['en', 'zz']];
        }
    };
}

it('boots inertia and lattice ahead of the package providers', function (): void {
    $case = fakePackageTestCase();

    $providers = (fn (): array => $this->getPackageProviders(app()))->call($case);

    expect($providers)->toBe([
        InertiaServiceProvider::class,
        LatticeServiceProvider::class,
        WorkbenchServiceProvider::class,
    ]);
});

it('applies the sqlite app defaults, package config, and workbench view path', function (): void {
    $case = fakePackageTestCase();
    config()->set('database.default', 'mysql');
    config()->set('view.paths', ['/existing']);

    $app = $this->app;
    (fn () => $this->getEnvironmentSetUp($app))->call($case);

    expect(config('database.default'))->toBe('sqlite')
        ->and(config('database.connections.sqlite.database'))->toBe(':memory:')
        ->and((string) config('app.key'))->toStartWith('base64:')
        ->and(config('lattice.i18n.locales'))->toBe(['en', 'zz'])
        ->and(config('view.paths'))->toBe([
            '/existing',
            package_path('workbench/resources/views'),
        ]);
});
