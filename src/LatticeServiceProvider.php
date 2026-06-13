<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use BackedEnum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Inertia\ResponseFactory;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Console\Commands\DiscoverCacheCommand;
use Lattice\Lattice\Console\Commands\DiscoverClearCommand;
use Lattice\Lattice\Console\Commands\MakeColumnCommand;
use Lattice\Lattice\Console\Commands\MakeComponentCommand;
use Lattice\Lattice\Console\Commands\MakeFieldCommand;
use Lattice\Lattice\Console\Commands\TypeScriptCommand;
use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Pages\PageRegistry;
use Lattice\Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Lattice\Tables\TableRegistry;
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
            ->hasRoute('web')
            ->hasConsoleCommands([
                TypeScriptCommand::class,
                MakeFieldCommand::class,
                MakeComponentCommand::class,
                MakeColumnCommand::class,
                DiscoverCacheCommand::class,
                DiscoverClearCommand::class,
            ]);
    }

    public function packageRegistered(): void
    {
        $this->app->singleton(FormRegistry::class);
        $this->app->singleton(TableRegistry::class);
        $this->app->singleton(FragmentRegistry::class);
        $this->app->singleton(LayoutRegistry::class);
        $this->app->singleton(ActionRegistry::class);
        $this->app->singleton(BulkActionRegistry::class);
        $this->app->singleton(PageRegistry::class);
        $this->app->singleton(DefinitionDiscovery::class);
        $this->app->alias(DefinitionDiscovery::class, DiscoversDefinitions::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->singleton(LatticeRegistry::class);

        // Default role; the workbench rebinds this to BaseProfile.
        $this->app->bind(TypeScriptProfile::class, AugmentProfile::class);

        if (! ResponseFactory::hasMacro('toRoute')) {
            ResponseFactory::macro(
                'toRoute',
                fn (BackedEnum|string $route, array|BackedEnum|string|int|null $parameters = [], int $status = 302, array $headers = []): RedirectResponse => to_route($route, $parameters, $status, $headers),
            );
        }
    }

    public function packageBooted(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../stubs/lattice/plugin.ts' => resource_path('js/lattice/plugin.ts'),
                __DIR__.'/../stubs/lattice/columns.ts' => resource_path('js/lattice/columns.ts'),
            ], 'lattice-js');
        }

        $this->optimizes(
            optimize: 'lattice:discover-cache',
            clear: 'lattice:discover-clear',
            key: 'lattice',
        );

        Lattice::registerConfiguredDefinitions();

        foreach (DefinitionDiscovery::configuredPaths() as $path => $namespace) {
            Lattice::discover($path, $namespace);
        }

        // Deferred so pages registered by any provider's boot() (e.g. an app's
        // own `Lattice::pages([...])`) are collected before the routes are built.
        $this->app->booted(fn () => $this->bootPages());
    }

    /**
     * Build a route for every discovered and registered page — but only when the
     * router is not serving a cached route table. With `route:cache` active,
     * Laravel loads the routes from the cache, so re-scanning the filesystem and
     * re-registering them here on every request would be redundant work.
     */
    public function bootPages(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        foreach (Lattice::pages()->all() as $page) {
            Route::get($page->route, [$page->class, 'render'])
                ->name($page->name)
                ->middleware($page->middleware);
        }

        Route::getRoutes()->refreshNameLookups();
    }
}
