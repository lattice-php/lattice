<?php
declare(strict_types=1);

namespace Lattice\Lattice;

use BackedEnum;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Console\AboutCommand;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Inertia\ResponseFactory;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Console\Commands\DiscoverCacheCommand;
use Lattice\Lattice\Console\Commands\DiscoverClearCommand;
use Lattice\Lattice\Console\Commands\MakeActionCommand;
use Lattice\Lattice\Console\Commands\MakeBulkActionCommand;
use Lattice\Lattice\Console\Commands\MakeColumnCommand;
use Lattice\Lattice\Console\Commands\MakeComponentCommand;
use Lattice\Lattice\Console\Commands\MakeFieldCommand;
use Lattice\Lattice\Console\Commands\MakeFormCommand;
use Lattice\Lattice\Console\Commands\MakeFragmentCommand;
use Lattice\Lattice\Console\Commands\MakeLayoutCommand;
use Lattice\Lattice\Console\Commands\MakePageCommand;
use Lattice\Lattice\Console\Commands\MakeRemoteSourceCommand;
use Lattice\Lattice\Console\Commands\MakeTableCommand;
use Lattice\Lattice\Console\Commands\PruneNotificationsCommand;
use Lattice\Lattice\Console\Commands\PublishAssetsCommand;
use Lattice\Lattice\Console\Commands\TypeScriptCommand;
use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Discovery\ComponentPackages;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\PageMetadataResolver;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Core\Services\RequestReferenceIdentity;
use Lattice\Lattice\Effects\EffectFlasher;
use Lattice\Lattice\Effects\EffectRegistry;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\FormRegistry;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Lattice\Lattice\Fragments\FragmentRegistry;
use Lattice\Lattice\Http\Middleware\SetLocale;
use Lattice\Lattice\Http\PageRegistry;
use Lattice\Lattice\Layouts\LayoutRegistry;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use Lattice\Lattice\Support\Evaluation\Evaluator;
use Lattice\Lattice\Support\Frontend\StandaloneAssets;
use Lattice\Lattice\Support\Theme\ThemeRenderer;
use Lattice\Lattice\Support\TypeScript\AugmentProfile;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\SlotRegistry;
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
                MakePageCommand::class,
                MakeFormCommand::class,
                MakeTableCommand::class,
                MakeActionCommand::class,
                MakeBulkActionCommand::class,
                MakeFragmentCommand::class,
                MakeLayoutCommand::class,
                MakeRemoteSourceCommand::class,
                DiscoverCacheCommand::class,
                DiscoverClearCommand::class,
                PruneNotificationsCommand::class,
                PublishAssetsCommand::class,
            ]);
    }

    public function packageRegistered(): void
    {
        DiscoveryKinds::register('forms', AsForm::class);
        DiscoveryKinds::register('tables', AsTable::class);
        DiscoveryKinds::register('actions', AsAction::class);
        DiscoveryKinds::register('bulk-actions', AsBulkAction::class);
        DiscoveryKinds::register('fragments', AsFragment::class);
        DiscoveryKinds::register('remote-sources', AsRemoteSource::class);
        DiscoveryKinds::register('layouts', AsLayout::class);

        $this->app->singleton(FormRegistry::class);
        $this->app->singleton(TableRegistry::class);
        $this->app->singleton(FragmentRegistry::class);
        $this->app->singleton(LayoutRegistry::class);
        $this->app->singleton(ActionRegistry::class);
        $this->app->singleton(BulkActionRegistry::class);
        $this->app->singleton(PageRegistry::class);
        $this->app->singleton(RemoteSourceRegistry::class);
        $this->app->singleton(SlotRegistry::class);
        $this->app->singleton(ResolvesReferenceIdentity::class, RequestReferenceIdentity::class);
        $this->app->singleton(ComponentReferenceSigner::class);
        $this->app->alias(ComponentReferenceSigner::class, SignsComponentReferences::class);
        $this->app->singleton(LatticeRegistry::class);
        $this->app->singleton(DiscoveryManifest::class);
        $this->app->singleton(PageMetadataResolver::class);
        $this->app->singleton(StandaloneAssets::class);
        $this->app->singleton(ThemeRenderer::class);
        $this->app->singleton(Evaluator::class, fn ($app): Evaluator => new Evaluator($app, [Component::class]));
        $this->app->scoped(EffectFlasher::class);

        $this->app->singleton(EffectRegistry::class, fn (): EffectRegistry => EffectRegistry::withBuiltins());
        $this->app->singleton(EditorExtensionRegistry::class, fn (): EditorExtensionRegistry => EditorExtensionRegistry::withBuiltins());

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
        EncryptCookies::except('locale');

        // Serve Lattice's built-in chrome translations under the `lattice`
        // namespace so consumers get them (and i18next /locales/{lng}/lattice.json)
        // without copying any files. Each lang group is its own file so the
        // i18next keys stay un-prefixed (e.g. `editor.bold`, not `lattice.editor.bold`).
        // Registered directly on the loader rather than via loadTranslationsFrom():
        // the i18next route resolves only the translation loader, never the
        // translator, so the deferred loadTranslationsFrom() callback would never fire.
        $translationLoader = $this->app->make('translation.loader');
        $translationLoader->addNamespace(self::$name, __DIR__.'/../lang');

        $this->callAfterResolving(Kernel::class, function (Kernel $kernel): void {
            if ($kernel instanceof HttpKernel) {
                $kernel->appendMiddlewareToGroup('web', SetLocale::class);
            }
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
     */
    public function bootPages(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        foreach (Lattice::pageRegistry()->all() as $page) {
            if ($page->route === null) {
                continue;
            }

            Route::get($page->route, [$page->class, 'render'])
                ->name($page->name)
                ->middleware($page->middleware);
        }

        Route::getRoutes()->refreshNameLookups();
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
}
