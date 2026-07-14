<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\NumberColumnsTable;

#[AsPage(route: '/tables/columns/number')]
final class NumberColumnsPage extends TableDemoPage
{
    protected function table(): string
    {
        return NumberColumnsTable::class;
    }

    protected function slug(): string
    {
        return 'number-columns';
    }
}
