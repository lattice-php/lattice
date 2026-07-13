<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\TextColumnsTable;

#[AsPage(route: '/tables/columns/text')]
final class TextColumnsPage extends TableDemoPage
{
    protected function table(): string
    {
        return TextColumnsTable::class;
    }

    protected function slug(): string
    {
        return 'text-columns';
    }
}
