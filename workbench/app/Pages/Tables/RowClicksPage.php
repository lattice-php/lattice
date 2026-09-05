<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Core\Attributes\AsPage;
use Workbench\App\Tables\RowClicksTable;

#[AsPage(route: '/tables/row-clicks')]
final class RowClicksPage extends TableDemoPage
{
    protected function table(): string
    {
        return RowClicksTable::class;
    }

    protected function slug(): string
    {
        return 'row-clicks';
    }
}
