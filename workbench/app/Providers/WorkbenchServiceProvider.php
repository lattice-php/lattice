<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Support\ServiceProvider;
use Inertia\Middleware as InertiaMiddleware;
use Laravel\Boost\Install\GuidelineComposer;
use Laravel\Boost\Install\SkillComposer;
use Laravel\Boost\Support\Config;
use Laravel\Roster\Roster;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Workbench\App\Support\BoostConfig;
use Workbench\App\Support\BoostGuidelineComposer;
use Workbench\App\Support\BoostSkillComposer;
use Workbench\App\Support\TypeScript\BaseProfile;

use function Orchestra\Testbench\package_path;

class WorkbenchServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        config(['lattice.discover' => [
            package_path('workbench/app'),
        ]]);

        // Rebind so lattice:typescript regenerates the package's own built-in types.
        $this->app->bind(TypeScriptProfile::class, BaseProfile::class);
        $this->useWorkbenchDatabase();
        $this->readBoostConfigFromPackageRoot();
        $this->serveLatticeTranslations();
    }

    /**
     * Serve Lattice's built-in `lattice` namespace from the package's lang/ dir
     * via laravel-i18next, so the React chrome can load translated strings.
     * Namespaced + nested output matches the frontend's namespace and key paths.
     */
    private function serveLatticeTranslations(): void
    {
        config([
            'i18next.namespaces' => true,
            'i18next.output' => 'nested',
        ]);

        // Point lang_path() at the package's lang/ dir so saveMissing dumps land in
        // the package, not the workbench or the read-only Testbench skeleton in vendor.
        $skeletonLangPath = $this->app->langPath();
        $this->app->useLangPath(package_path('lang'));

        $this->callAfterResolving('translation.loader', function ($loader) use ($skeletonLangPath): void {
            $loader->addPath($skeletonLangPath);
            $loader->addPath(package_path('workbench/lang'));
            $loader->addNamespace('workbench', package_path('workbench/lang'));
        });
    }

    /**
     * Persist the served workbench's data in workbench/database/workbench.sqlite so
     * it can be inspected directly (e.g. opened in an IDE). Tests keep their own
     * throwaway database configured in the test case.
     */
    private function useWorkbenchDatabase(): void
    {
        if ($this->app->runningUnitTests()) {
            return;
        }

        $database = package_path('workbench/database/workbench.sqlite');

        if (! is_dir(dirname($database))) {
            mkdir(dirname($database), 0755, true);
        }

        if (! file_exists($database)) {
            touch($database);
        }

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => $database,
            // Lock-capable, table-free cache so laravel-i18next's saveMissing dump
            // (Cache::lock) works without a cache_locks table in the served app.
            'cache.default' => 'array',
        ]);
    }

    public function boot(Kernel $kernel): void
    {
        if ($kernel instanceof HttpKernel) {
            $kernel->appendMiddlewareToGroup('web', InertiaMiddleware::class);
        }

        $this->loadMigrationsFrom(package_path('workbench/database/migrations'));

        $this->pointBoostAtPackageRoot();
        $this->redirectBoostSkillsToPackageRoot();
    }

    private function readBoostConfigFromPackageRoot(): void
    {
        if (! class_exists(Config::class)) {
            return;
        }

        $this->app->singleton(Config::class, fn (): Config => new BoostConfig);
        $this->app->bind(GuidelineComposer::class, BoostGuidelineComposer::class);
        $this->app->bind(SkillComposer::class, BoostSkillComposer::class);
    }

    private function pointBoostAtPackageRoot(): void
    {
        if (! class_exists(Roster::class)) {
            return;
        }

        $this->app->singleton(Roster::class, fn (): Roster => Roster::scan(package_path()));
    }

    private function redirectBoostSkillsToPackageRoot(): void
    {
        if (! class_exists(Roster::class)) {
            return;
        }

        $skeleton = ltrim(str_replace(package_path(), '', base_path()), '/');
        $upToPackageRoot = str_repeat('../', substr_count($skeleton, '/') + 1);

        config([
            'boost.agents.claude_code.skills_path' => $upToPackageRoot.'.claude/skills',
            'boost.agents.codex.skills_path' => $upToPackageRoot.'.agents/skills',
        ]);
    }
}
