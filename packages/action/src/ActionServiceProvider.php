<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Illuminate\Support\ServiceProvider;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\LatticeRegistry;
use Lattice\Form\FormServiceProvider;

final class ActionServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(FormServiceProvider::class);

        DiscoveryKinds::register('actions', AsAction::class);
        DiscoveryKinds::register('bulk-actions', AsBulkAction::class);

        $this->app->singleton(ActionRegistry::class);
        $this->app->singleton(BulkActionRegistry::class);
        $this->app->singleton('lattice.actions.component', fn (): callable => fn (string $actionClass, array $context): Action => Action::use($actionClass, $context));

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('actions', fn (string|array $actions) => $this->app->make(ActionRegistry::class)->register($actions));
        $lattice->registerCapability('bulkActions', fn (string|array $bulkActions) => $this->app->make(BulkActionRegistry::class)->register($bulkActions));
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
