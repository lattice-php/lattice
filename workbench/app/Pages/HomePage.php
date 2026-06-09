<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Core\Components\Badge;
use Bambamboole\Lattice\Core\Components\Card;
use Bambamboole\Lattice\Core\Components\Grid;
use Bambamboole\Lattice\Core\Components\Heading;
use Bambamboole\Lattice\Core\Components\Stack;
use Bambamboole\Lattice\Core\Components\Text;
use Bambamboole\Lattice\Core\Enums\Gap;
use Bambamboole\Lattice\Core\PageSchema;
use Bambamboole\Lattice\Http\Page;
use Bambamboole\Lattice\Tables\Components\Table;
use Workbench\App\Tables\UsersTable;

final class HomePage extends Page
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
