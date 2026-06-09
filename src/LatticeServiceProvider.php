<?php

declare(strict_types=1);

namespace Bambamboole\Lattice;

use BackedEnum;
use Bambamboole\Lattice\Actions\ActionRegistry;
use Bambamboole\Lattice\Actions\BulkActionRegistry;
use Bambamboole\Lattice\Core\Contracts\DiscoversDefinitions;
use Bambamboole\Lattice\Core\Contracts\SignsComponentReferences;
use Bambamboole\Lattice\Core\Services\ComponentReferenceSigner;
use Bambamboole\Lattice\Discovery\DefinitionDiscovery;
use Bambamboole\Lattice\Facades\Lattice;
use Bambamboole\Lattice\Forms\FormRegistry;
use Bambamboole\Lattice\Fragments\FragmentRegistry;
use Bambamboole\Lattice\Menu\MenuItem;
use Bambamboole\Lattice\Menu\MenuRegistry;
use Bambamboole\Lattice\Tables\TableRegistry;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Inertia\ResponseFactory;
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
        $this->app->singleton(FragmentRegistry::class);
        $this->app->singleton(ActionRegistry::class);
        $this->app->singleton(BulkActionRegistry::class);
        $this->app->singleton(MenuRegistry::class);
        $this->app->singleton(DefinitionDiscovery::class);
        $this->app->alias(DefinitionDiscovery::class, DiscoversDefinitions::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->singleton(LatticeRegistry::class);

        if (! Router::hasMacro('latticePage')) {
            Router::macro('latticePage', fn (string $uri, string $page): Route => Lattice::page($uri, $page));
        }

        if (! Route::hasMacro('menu')) {
            Route::macro('menu', function (BackedEnum|string $location, Closure|string|null $label = null, BackedEnum|string|null $icon = null): Route {
                $menus = $this->getAction('lattice.menus');

                if (! is_array($menus)) {
                    $menus = [];
                }

                $locationKey = $location instanceof BackedEnum ? (string) $location->value : $location;
                $menus[$locationKey] = MenuItem::configure($label, $icon)->toArray();

                $this->setAction([
                    ...$this->getAction(),
                    'lattice.menus' => $menus,
                ]);

                return $this;
            });
        }

        if (! Route::hasMacro('sidebar')) {
            Route::macro('sidebar', function (Closure|string|null $label = null, BackedEnum|string|null $icon = null): Route {
                return $this->menu('sidebar', $label, $icon);
            });
        }

        if (! ResponseFactory::hasMacro('toRoute')) {
            ResponseFactory::macro(
                'toRoute',
                fn (BackedEnum|string $route, array|BackedEnum|string|int|null $parameters = [], int $status = 302, array $headers = []): RedirectResponse => to_route($route, $parameters, $status, $headers),
            );
        }
    }

    public function packageBooted(): void
    {
        Lattice::registerConfiguredDefinitions();

        $discoveryPaths = config('lattice.discover', []);

        if (! is_array($discoveryPaths)) {
            return;
        }

        foreach ($discoveryPaths as $path => $namespace) {
            if (is_array($namespace)) {
                $path = $namespace['path'] ?? null;
                $namespace = $namespace['namespace'] ?? null;
            }

            if (is_string($path) && is_string($namespace)) {
                Lattice::discover($path, $namespace);
            }
        }
    }
}
