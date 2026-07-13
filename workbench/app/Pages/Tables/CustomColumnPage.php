<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\CustomColumnTable;

#[AsPage(route: '/tables/columns/custom')]
final class CustomColumnPage extends TableDemoPage
{
    protected function table(): string
    {
        return CustomColumnTable::class;
    }

    protected function slug(): string
    {
        return 'custom-column';
    }
}
