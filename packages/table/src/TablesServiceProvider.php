<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Filters\Filter;

final class TablesServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(FormsServiceProvider::class);

        DiscoveryKinds::register('tables', AsTable::class);

        $this->app->singleton(TableRegistry::class);

        Lattice::wireSource(dirname(__DIR__));
        Lattice::wireFamily('column', AsColumn::class, Column::class, marker: true);
        Lattice::wireFamily('filter', AsFilter::class, Filter::class, marker: true);
    }
}
