<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\ProductsTable;

#[AsPage(route: '/tables/actions')]
final class ActionsPage extends TableDemoPage
{
    protected function table(): string
    {
        return ProductsTable::class;
    }

    protected function slug(): string
    {
        return 'actions';
    }
}
