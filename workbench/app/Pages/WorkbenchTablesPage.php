<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Components\Core\Badge;
use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Core\Tab;
use Bambamboole\Lattice\Components\Core\Tabs;
use Bambamboole\Lattice\Components\Core\Text;
use Bambamboole\Lattice\Components\Table\Table;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Workbench\App\Tables\UsersInfiniteTable;
use Workbench\App\Tables\UsersNoneTable;
use Workbench\App\Tables\UsersSimpleTable;
use Workbench\App\Tables\UsersTablePaginationTable;

final class WorkbenchTablesPage extends Page
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
