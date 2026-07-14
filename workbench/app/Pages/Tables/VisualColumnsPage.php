<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\VisualColumnsTable;

#[AsPage(route: '/tables/columns/visual')]
final class VisualColumnsPage extends TableDemoPage
{
    protected function table(): string
    {
        return VisualColumnsTable::class;
    }

    protected function slug(): string
    {
        return 'visual-columns';
    }
}
