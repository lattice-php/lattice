<?php
declare(strict_types=1);

namespace Lattice\Table;

use Illuminate\Support\ServiceProvider;
use Lattice\Core\Attributes\AsTable;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
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

        Lattice::wireSource(dirname(__DIR__));
        Lattice::wireFamily('column', AsColumn::class, Column::class, marker: true);
        Lattice::wireFamily('filter', AsFilter::class, Filter::class, marker: true);
    }
}
