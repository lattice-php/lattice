<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Workbench\App\Tables\UsersBehaviorTable;

#[AsPage(route: '/tables/behavior')]
final class BehaviorPage extends TableDemoPage
{
    protected function table(): string
    {
        return UsersBehaviorTable::class;
    }

    protected function slug(): string
    {
        return 'behavior';
    }
}
