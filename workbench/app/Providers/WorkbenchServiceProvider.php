<?php

declare(strict_types=1);

namespace Workbench\App\Providers;

use Bambamboole\Lattice\Facades\Lattice;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Support\ServiceProvider;
use Inertia\Middleware as InertiaMiddleware;
use Laravel\Boost\Install\GuidelineComposer;
use Laravel\Boost\Install\SkillComposer;
use Laravel\Boost\Support\Config;
use Laravel\Roster\Roster;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Forms\DependentDemoForm;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Forms\ShowcaseForm;
use Workbench\App\Support\BoostConfig;
use Workbench\App\Support\BoostGuidelineComposer;
use Workbench\App\Support\BoostSkillComposer;
use Workbench\App\Tables\ProductsTable;
use Workbench\App\Tables\UsersInfiniteTable;
use Workbench\App\Tables\UsersNoneTable;
use Workbench\App\Tables\UsersSimpleTable;
use Workbench\App\Tables\UsersTable;
use Workbench\App\Tables\UsersTablePaginationTable;

use function Orchestra\Testbench\package_path;

class WorkbenchServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->readBoostConfigFromPackageRoot();
    }

    public function boot(Kernel $kernel): void
    {
        if ($kernel instanceof HttpKernel) {
            $kernel->appendMiddlewareToGroup('web', InertiaMiddleware::class);
        }

        $this->loadMigrationsFrom(package_path('workbench/database/migrations'));

        Lattice::actions([
            ArchiveProductAction::class,
        ]);

        Lattice::bulkActions([
            ArchiveSelectedProductsAction::class,
        ]);

        Lattice::forms([
            DependentDemoForm::class,
            ProductForm::class,
            ShowcaseForm::class,
        ]);

        Lattice::tables([
            ProductsTable::class,
            UsersTable::class,
            UsersNoneTable::class,
            UsersSimpleTable::class,
            UsersTablePaginationTable::class,
            UsersInfiniteTable::class,
        ]);

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
