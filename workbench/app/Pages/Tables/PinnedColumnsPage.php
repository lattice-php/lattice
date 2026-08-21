<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Core\Attributes\AsPage;
use Workbench\App\Tables\PinnedColumnsTable;

#[AsPage(route: '/tables/columns/pinned')]
final class PinnedColumnsPage extends TableDemoPage
{
    protected function table(): string
    {
        return PinnedColumnsTable::class;
    }

    protected function slug(): string
    {
        return 'pinned-columns';
    }
}
