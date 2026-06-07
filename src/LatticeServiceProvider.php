<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use Bambamboole\Lattice\Forms\FormRegistry;
use Bambamboole\Lattice\Tables\TableRegistry;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

final class LatticeServiceProvider extends PackageServiceProvider
{
    public static string $name = 'lattice';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(self::$name)
            ->hasConfigFile()
            ->hasRoute('web');
    }

    public function packageRegistered(): void
    {
        $this->app->singleton(FormRegistry::class);
        $this->app->singleton(TableRegistry::class);
    }

    public function packageBooted(): void
    {
        $forms = config('lattice.forms.registered', []);

        if (is_array($forms) && $forms !== []) {
            Lattice::forms($forms);
        }

        $tables = config('lattice.tables.registered', []);

        if (is_array($tables) && $tables !== []) {
            Lattice::tables($tables);
        }
    }
}
