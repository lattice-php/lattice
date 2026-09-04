<?php
declare(strict_types=1);

namespace Lattice;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Console\AboutCommand;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Inertia\ResponseFactory;
use Lattice\Actions\ActionServiceProvider;
use Lattice\Console\Commands\DiscoverCacheCommand;
use Lattice\Console\Commands\DiscoverClearCommand;
use Lattice\Console\Commands\InstallCommand;
use Lattice\Console\Commands\MakeColumnCommand;
use Lattice\Console\Commands\MakeComponentCommand;
use Lattice\Console\Commands\MakeDefinitionCommand;
use Lattice\Console\Commands\MakeFieldCommand;
use Lattice\Console\Commands\PruneNotificationsCommand;
use Lattice\Console\Commands\PublishAssetsCommand;
use Lattice\Console\Commands\TypeScriptCommand;
use Lattice\Console\Commands\UpdateCommand;
use Lattice\Core\Attributes\AsFragment;
use Lattice\Core\Attributes\AsLayout;
use Lattice\Core\Attributes\AsRemoteSource;
use Lattice\Core\Contracts\BuildsModelContextResolvers;
use Lattice\Core\Contracts\ResolvesRemoteSourceEndpoints;
use Lattice\Core\Discovery\ComponentPackages;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\LatticeRegistry;
use Lattice\Core\PageMetadata;
use Lattice\Core\Wire\WireSourceCatalog;
use Lattice\Form\FormServiceProvider;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Fragments\FragmentRegistry;
use Lattice\Http\Middleware\SetLocale;
use Lattice\Http\PageRegistry;
use Lattice\Layouts\LayoutDefinition;
use Lattice\Layouts\LayoutRegistry;
use Lattice\Remote\RemoteSourceDefinition;
use Lattice\Remote\RemoteSourceRegistry;
use Lattice\Support\EloquentContextResolvers;
use Lattice\Support\Frontend\StandaloneAssets;
use Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Table\TableServiceProvider;
use Lattice\Theme\Theme;
use Lattice\Theme\ThemeRenderer;
use Lattice\Ui\UiServiceProvider;
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
                MakeComponentCommand::class,
                MakeFieldCommand::class,
                MakeColumnCommand::class,
                DiscoverCacheCommand::class,
                DiscoverClearCommand::class,
                InstallCommand::class,
                PruneNotificationsCommand::class,
                PublishAssetsCommand::class,
                UpdateCommand::class,
            ]);
    }

    public function packageRegistered(): void
    {
        $this->app->register(UiServiceProvider::class);
        $this->app->register(FormServiceProvider::class);
        $this->app->register(TableServiceProvider::class);
        $this->app->register(ActionServiceProvider::class);
        $lattice = $this->app->make(LatticeRegistry::class);

        $this->app->singleton(WireSourceCatalog::class, static fn (): WireSourceCatalog => WireSourceCatalog::fromApplication());
        $this->app->bind(TypeScriptProfile::class, AugmentProfile::class);
        $this->app->bind(BuildsModelContextResolvers::class, EloquentContextResolvers::class);

        if ($this->app->runningInConsole()) {
            $this->commands(MakeDefinitionCommand::all());
        }

        DiscoveryKinds::register('fragments', AsFragment::class);
        DiscoveryKinds::register('remote-sources', AsRemoteSource::class);
        DiscoveryKinds::register('layouts', AsLayout::class);

        $this->app->singleton(FragmentRegistry::class);
        $this->app->singleton(LayoutRegistry::class);
        $this->app->singleton(PageRegistry::class);
        $this->app->singleton(RemoteSourceRegistry::class);
        $this->app->bind(ResolvesRemoteSourceEndpoints::class, RemoteSourceRegistry::class);
        $this->app->singleton(StandaloneAssets::class);
        $this->app->singleton(ThemeRenderer::class);

        $lattice->registerCapability('fragments', $this->registerFragments(...));
        $lattice->registerCapability('layouts', $this->registerLayouts(...));
        $lattice->registerCapability('layoutRegistry', fn (): LayoutRegistry => $this->app->make(LayoutRegistry::class));
        $lattice->registerCapability('pages', $this->registerPages(...));
        $lattice->registerCapability('pageRegistry', fn (): PageRegistry => $this->app->make(PageRegistry::class));
        $lattice->registerCapability('remoteSources', $this->registerRemoteSources(...));
        $lattice->registerCapability('remoteSourceResolver', fn (callable $resolver) => $this->app->make(RemoteSourceRegistry::class)->resolveUsing($resolver));
        $lattice->registerCapability('remoteSourceRegistry', fn (): RemoteSourceRegistry => $this->app->make(RemoteSourceRegistry::class));
        $lattice->registerCapability('theme', fn (Theme|Closure $theme) => $this->app->make(ThemeRenderer::class)->register($theme));

        if (! ResponseFactory::hasMacro('toRoute')) {
            ResponseFactory::macro(
                'toRoute',
                fn (BackedEnum|string $route, array|BackedEnum|string|int|null $parameters = [], int $status = 302, array $headers = []): RedirectResponse => to_route($route, $parameters, $status, $headers),
            );
        }
    }

    public function packageBooted(): void
    {
        EncryptCookies::except(['locale', 'appearance']);

        $this->app->make('translation.loader')->addNamespace(self::$name, __DIR__.'/../lang');

        $this->callAfterResolving(Kernel::class, function (Kernel $kernel): void {
            if ($kernel instanceof HttpKernel) {
                $kernel->appendMiddlewareToGroup('web', SetLocale::class);
            }
        });

        $this->callAfterResolving(ResponseFactory::class, function (ResponseFactory $inertia): void {
            // Array form on purpose: share('lattice.urls', ...) Arr::sets a real
            // nested `lattice` array, which a Lattice page's own `lattice` prop
            // then clobbers wholesale. A literal dotted key survives the merge
            // and is expanded into the nested position at resolve time.
            $inertia->share([
                'lattice.urls' => fn (): array => [
                    'refreshRef' => route('lattice.refs.refresh', absolute: false),
                ],
                // Lets the SSR render start from the user's theme instead of "system".
                'lattice.appearance' => function (): ?string {
                    $appearance = request()->cookies->get('appearance');

                    return in_array($appearance, ['light', 'dark', 'system'], true) ? $appearance : null;
                },
            ]);
        });

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../stubs/registry.ts' => resource_path('js/registry.ts'),
            ], 'lattice-js');

            $this->publishes([
                __DIR__.'/../lang' => $this->app->langPath('vendor/'.self::$name),
            ], 'lattice-translations');

            AboutCommand::add('Lattice', fn (DiscoveryManifest $manifest): array => $this->aboutData($manifest));
        }

        $this->optimizes(
            optimize: 'lattice:discover-cache',
            clear: 'lattice:discover-clear',
            key: 'lattice',
        );

        // Deferred so pages registered by any provider's boot() (e.g. an app's
        // own `Lattice::pages([...])`) are collected before the routes are built.
        $this->app->booted(fn () => $this->bootPages());

        Blade::directive('latticeHead', static fn (string $expression): string => sprintf('<?php echo app(\%s::class)->head(%s); ?>', StandaloneAssets::class, $expression));
        Blade::directive('latticeScripts', static fn (): string => sprintf('<?php echo app(\%s::class)->scripts(); ?>', StandaloneAssets::class));
        Blade::directive('latticeTheme', static fn (): string => sprintf('<?php echo app(\%s::class)->style(); ?>', ThemeRenderer::class));
    }

    /**
     * Build a route for every discovered and registered page that declares one
     * — but only when the router is not serving a cached route table. With
     * `route:cache` active, Laravel loads the routes from the cache, so
     * re-scanning the filesystem and re-registering them here on every request
     * would be redundant work.
     *
     * A page with no route is a valid embedded page (rendered by returning it
     * from a developer-owned controller, never dispatched by Lattice itself),
     * so it is skipped here rather than passed to `Route::get()`.
     *
     * Routes register most-specific first because the router matches in
     * registration order: discovery order would let `/orders/{order}` swallow
     * `/orders/create`. `route:cache` compiles this same order, so the fix
     * carries into the cached route table.
     */
    public function bootPages(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        $pages = Lattice::pageRegistry()->all();

        usort($pages, $this->compareRouteSpecificity(...));

        foreach ($pages as $page) {
            if ($page->route === null) {
                continue;
            }

            Route::get($page->route, [$page->class, 'render'])
                ->name($page->name)
                ->middleware(array_values(array_unique([
                    ...config('lattice.pages.middleware', ['web']),
                    ...$page->middleware ?? [],
                    ...array_map(static fn (string $ability): string => 'can:'.$ability, $page->can),
                ])));
        }

        Route::getRoutes()->refreshNameLookups();
    }

    /**
     * Lexicographic comparison of per-segment flags (static = 0, parameter = 1),
     * so `/orders/create` outranks `/orders/{order}` at the segment where they
     * diverge. PHP's array comparison ranks a smaller segment count first, which
     * is safe because routes of different lengths cannot shadow each other, and
     * `usort` being stable keeps discovery order between equally specific routes.
     */
    private function compareRouteSpecificity(PageMetadata $a, PageMetadata $b): int
    {
        $flags = static fn (PageMetadata $page): array => array_map(
            static fn (string $segment): int => (int) str_starts_with($segment, '{'),
            explode('/', trim((string) $page->route, '/')),
        );

        return $flags($a) <=> $flags($b);
    }

    /**
     * @return array<string, mixed>
     */
    private function aboutData(DiscoveryManifest $manifest): array
    {
        $configured = array_values(array_filter((array) config('lattice.discover', []), is_string(...)));
        $packages = ComponentPackages::packages();

        $roots = collect($packages)
            ->filter(fn (array $package): bool => $package['roots'] !== [])
            ->map(fn (array $package): array => [
                'name' => $package['name'],
                'roots' => array_map($this->relativeToBase(...), $package['roots']),
            ])
            ->values()
            ->all();

        $plugins = collect($packages)
            ->filter(fn (array $package): bool => $package['plugin'] !== null)
            ->map(fn (array $package): array => [
                'name' => $package['name'],
                'plugin' => $this->relativeToBase($package['plugin']),
            ])
            ->values()
            ->all();

        return [
            'Discover Paths' => AboutCommand::format(
                array_map($this->relativeToBase(...), $configured),
                console: fn (array $paths): string => $paths === [] ? '<fg=yellow;options=bold>none</>' : implode(', ', $paths),
                json: fn (array $paths): array => $paths,
            ),
            'Package Roots' => AboutCommand::format(
                $roots,
                console: fn (array $roots): string => $roots === []
                    ? '<fg=yellow;options=bold>none</>'
                    : implode(', ', array_map(fn (array $package): string => $package['name'].': '.implode(', ', $package['roots']), $roots)),
                json: fn (array $roots): array => $roots,
            ),
            'Component Plugins' => AboutCommand::format(
                $plugins,
                console: fn (array $plugins): string => $plugins === []
                    ? '<fg=yellow;options=bold>none</>'
                    : implode(', ', array_map(fn (array $package): string => $package['name'].': '.$package['plugin'], $plugins)),
                json: fn (array $plugins): array => $plugins,
            ),
            'Manifest Cache' => AboutCommand::format(
                $manifest->isCached(),
                console: fn (bool $cached): string => $cached
                    ? '<fg=green;options=bold>CACHED</> '.$this->relativeToBase($manifest->path())
                    : '<fg=yellow;options=bold>NOT CACHED</>',
                json: fn (bool $cached): array => ['cached' => $cached, 'path' => $manifest->path()],
            ),
        ];
    }

    private function relativeToBase(string $path): string
    {
        $base = base_path().DIRECTORY_SEPARATOR;

        return str_starts_with($path, $base) ? substr($path, strlen($base)) : $path;
    }

    /** @param  class-string<FragmentDefinition>|array<int, class-string<FragmentDefinition>>  $fragments */
    private function registerFragments(string|array $fragments): void
    {
        $this->app->make(FragmentRegistry::class)->register($fragments);
    }

    /** @param  class-string<LayoutDefinition>|array<int, class-string<LayoutDefinition>>  $layouts */
    private function registerLayouts(string|array $layouts): void
    {
        $this->app->make(LayoutRegistry::class)->register($layouts);
    }

    /** @param  class-string|array<int, class-string>  $pages */
    private function registerPages(string|array $pages): void
    {
        $this->app->make(PageRegistry::class)->register($pages);
    }

    /** @param  class-string<RemoteSourceDefinition>|array<int, class-string<RemoteSourceDefinition>>  $sources */
    private function registerRemoteSources(string|array $sources): void
    {
        $this->app->make(RemoteSourceRegistry::class)->register($sources);
    }
}
