<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\UsersInfiniteTable;
use Workbench\App\Tables\UsersNoneTable;
use Workbench\App\Tables\UsersSimpleTable;
use Workbench\App\Tables\UsersTablePaginationTable;

final class TablesPage extends Page
{
    public function title(): string
    {
        return 'Lattice Tables';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('tables-page')
                ->gap(Gap::ExtraLarge)
                ->children([
                    Stack::make('tables-hero')
                        ->gap(Gap::Large)
                        ->children([
                            Badge::make('Tables'),
                            Heading::make('Pagination modes'),
                            Text::make('Each tab mounts its table on first open.'),
                        ]),
                    Tabs::make('pagination-mode-tabs')
                        ->defaultValue('none')
                        ->children([
                            Tab::make('none', 'None')->children([
                                Heading::make('No pagination', 2),
                                Table::lazy(UsersNoneTable::class),
                            ]),
                            Tab::make('simple', 'Simple')->children([
                                Heading::make('Simple pagination', 2),
                                Table::lazy(UsersSimpleTable::class),
                            ]),
                            Tab::make('table', 'Table')->children([
                                Heading::make('Table pagination', 2),
                                Table::lazy(UsersTablePaginationTable::class),
                            ]),
                            Tab::make('infinite', 'Infinite')->children([
                                Heading::make('Infinite pagination', 2),
                                Table::lazy(UsersInfiniteTable::class),
                            ]),
                        ]),
                ]),
        ]);
    }
}
