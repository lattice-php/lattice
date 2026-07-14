<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Pages\WorkbenchPage;
use Workbench\App\Tables\UsersInfiniteTable;
use Workbench\App\Tables\UsersNoneTable;
use Workbench\App\Tables\UsersSimpleTable;
use Workbench\App\Tables\UsersTablePaginationTable;

#[AsPage(route: '/tables/pagination')]
final class PaginationPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.tables.pagination.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('pagination-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.tables.pagination.description')),
                    Tabs::make('pagination-mode-tabs')
                        ->queryKey('type')
                        ->defaultValue('none')
                        ->schema([
                            Tab::make('none', __('workbench.pages.tables.pagination.none'))->schema([
                                Heading::make(__('workbench.pages.tables.pagination.none-heading'), 2),
                                Table::lazy(UsersNoneTable::class),
                            ]),
                            Tab::make('simple', __('workbench.pages.tables.pagination.simple'))->schema([
                                Heading::make(__('workbench.pages.tables.pagination.simple-heading'), 2),
                                Table::lazy(UsersSimpleTable::class),
                            ]),
                            Tab::make('table', __('workbench.pages.tables.pagination.table'))->schema([
                                Heading::make(__('workbench.pages.tables.pagination.table-heading'), 2),
                                Table::lazy(UsersTablePaginationTable::class),
                            ]),
                            Tab::make('infinite', __('workbench.pages.tables.pagination.infinite'))->schema([
                                Heading::make(__('workbench.pages.tables.pagination.infinite-heading'), 2),
                                Table::lazy(UsersInfiniteTable::class),
                            ]),
                        ]),
                ]),
        ]);
    }
}
