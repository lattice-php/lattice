<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\ProductFiltersTable;

#[AsPage(route: '/tables/filters')]
final class FiltersPage extends TableDemoPage
{
    protected function table(): string
    {
        return ProductFiltersTable::class;
    }

    protected function slug(): string
    {
        return 'filters';
    }
}
