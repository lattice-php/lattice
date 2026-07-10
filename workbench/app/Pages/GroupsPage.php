<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Align;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Tables\GroupsTable;

#[AsPage(route: '/groups', name: 'groups.index')]
class GroupsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.groups.pages.index.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('groups-page')
                ->gap(Gap::Large)
                ->schema([
                    Stack::make('groups-header')
                        ->direction('row')
                        ->align(Align::Center)
                        ->schema([
                            Heading::make(__('workbench.commerce.groups.pages.index.heading')),
                            Button::make(__('workbench.commerce.groups.pages.index.create'), 'create-group')
                                ->href('/groups/create'),
                        ]),
                    Table::use(GroupsTable::class),
                ]),
        ]);
    }
}
