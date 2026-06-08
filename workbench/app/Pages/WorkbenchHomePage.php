<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Components\Core\Badge;
use Bambamboole\Lattice\Components\Core\Card;
use Bambamboole\Lattice\Components\Core\Grid;
use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Core\Text;
use Bambamboole\Lattice\Components\Table\Table;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Workbench\App\Tables\UsersTable;

final class WorkbenchHomePage extends Page
{
    public function title(): string
    {
        return 'Lattice Workbench';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('workbench-page')
                ->gap(Gap::ExtraLarge)
                ->children([
                    Stack::make('workbench-hero')
                        ->gap(Gap::Large)
                        ->children([
                            Badge::make('Lattice Package'),
                            Heading::make('Workbench page'),
                            Text::make('Package primitives render through a host application page.'),
                        ]),
                    Grid::make('workbench-capabilities')
                        ->columns(2)
                        ->children([
                            Card::make('Components', 'Server-side component trees serialize to typed React nodes.'),
                            Card::make('Renderer', 'The package renderer resolves registered component types.'),
                        ]),
                    Heading::make('Workbench users', 2),
                    Table::use(UsersTable::class),
                ]),
        ]);
    }
}
