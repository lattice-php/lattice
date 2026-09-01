<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\PageSchema;
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
                        ->direction(Orientation::Horizontal)
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
