<?php
declare(strict_types=1);

namespace Lattice\Table;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsTable;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\LatticeRegistry;
use Lattice\Form\FormServiceProvider;
use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Attributes\AsFilter;
use Lattice\Table\Columns\Column;
use Lattice\Table\Filters\Filter;

final class TableServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(FormServiceProvider::class);

        DiscoveryKinds::register('tables', AsTable::class);

        $this->app->singleton(TableRegistry::class);

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('tables', fn (string|array $tables) => $this->app->make(TableRegistry::class)->register($tables));
        $lattice->wireSource(dirname(__DIR__));
        $lattice->wireFamily('column', AsColumn::class, Column::class, marker: true);
        $lattice->wireFamily('filter', AsFilter::class, Filter::class, marker: true);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
