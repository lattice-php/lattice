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
        $this->app->singleton('lattice.actions.component', fn (): callable => $this->makeActionComponent(...));

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('actions', $this->registerActions(...));
        $lattice->registerCapability('bulkActions', $this->registerBulkActions(...));
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }

    /**
     * @param  class-string<ActionDefinition>  $actionClass
     * @param  array<string, mixed>  $context
     */
    private function makeActionComponent(string $actionClass, array $context): Action
    {
        return Action::use($actionClass, $context);
    }

    /** @param  class-string<ActionDefinition>|array<int, class-string<ActionDefinition>>  $actions */
    private function registerActions(string|array $actions): void
    {
        $this->app->make(ActionRegistry::class)->register($actions);
    }

    /** @param  class-string<BulkActionDefinition>|array<int, class-string<BulkActionDefinition>>  $bulkActions */
    private function registerBulkActions(string|array $bulkActions): void
    {
        $this->app->make(BulkActionRegistry::class)->register($bulkActions);
    }
}
