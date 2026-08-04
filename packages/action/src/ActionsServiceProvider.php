<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Support\TypeScript\WireFamilies;

final class ActionsServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(FormsServiceProvider::class);
        $this->app->make(WireFamilies::class)->registerSource(__DIR__);

        DiscoveryKinds::register('actions', AsAction::class);
        DiscoveryKinds::register('bulk-actions', AsBulkAction::class);

        $this->app->singleton(ActionRegistry::class);
        $this->app->singleton(BulkActionRegistry::class);
        $this->app->singleton('lattice.actions.component', fn (): callable => fn (string $actionClass, array $context): Action => Action::use($actionClass, $context));
    }
}
