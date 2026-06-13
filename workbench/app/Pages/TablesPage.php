<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\UsersInfiniteTable;
use Workbench\App\Tables\UsersNoneTable;
use Workbench\App\Tables\UsersSimpleTable;
use Workbench\App\Tables\UsersTablePaginationTable;

#[Page(route: '/tables')]
final class TablesPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.tables.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('tables-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('tables-hero')
                        ->gap(Gap::Large)
                        ->schema([
                            Badge::make(__('workbench.pages.tables.badge')),
                            Heading::make(__('workbench.pages.tables.heading')),
                            Text::make(__('workbench.pages.tables.description')),
                        ]),
                    Tabs::make('pagination-mode-tabs')
                        ->defaultValue('none')
                        ->schema([
                            Tab::make('none', __('workbench.pages.tables.none'))->schema([
                                Heading::make(__('workbench.pages.tables.noneHeading'), 2),
                                Table::lazy(UsersNoneTable::class),
                            ]),
                            Tab::make('simple', __('workbench.pages.tables.simple'))->schema([
                                Heading::make(__('workbench.pages.tables.simpleHeading'), 2),
                                Table::lazy(UsersSimpleTable::class),
                            ]),
                            Tab::make('table', __('workbench.pages.tables.table'))->schema([
                                Heading::make(__('workbench.pages.tables.tableHeading'), 2),
                                Table::lazy(UsersTablePaginationTable::class),
                            ]),
                            Tab::make('infinite', __('workbench.pages.tables.infinite'))->schema([
                                Heading::make(__('workbench.pages.tables.infiniteHeading'), 2),
                                Table::lazy(UsersInfiniteTable::class),
                            ]),
                        ]),
                ]),
        ]);
    }
}
