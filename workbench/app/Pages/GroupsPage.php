<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
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
