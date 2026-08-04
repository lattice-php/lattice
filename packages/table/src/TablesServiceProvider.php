<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Forms\FormsServiceProvider;
use Lattice\Lattice\Support\TypeScript\WireFamilies;
use Lattice\Lattice\Support\TypeScript\WireFamily;
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

        $families = $this->app->make(WireFamilies::class);
        $families->registerSource(__DIR__);
        $families->register(new WireFamily('column', AsColumn::class, Column::class, marker: true));
        $families->register(new WireFamily('filter', AsFilter::class, Filter::class, marker: true));
    }
}
