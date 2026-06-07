<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

final class LatticeServiceProvider extends PackageServiceProvider
{
    public static string $name = 'lattice';

    public function configurePackage(Package $package): void
    {
        $package->name(self::$name);
    }
}
