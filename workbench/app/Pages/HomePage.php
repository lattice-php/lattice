<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\UsersTable;

final class HomePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Lattice Workbench';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('workbench-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('workbench-hero')
                        ->gap(Gap::Large)
                        ->schema([
                            Badge::make('Lattice Package'),
                            Heading::make('Workbench page'),
                            Text::make('Package primitives render through a host application page.'),
                        ]),
                    Grid::make('workbench-capabilities')
                        ->columns(2)
                        ->schema([
                            Card::make('Components', 'Server-side component trees serialize to typed React nodes.'),
                            Card::make('Renderer', 'The package renderer resolves registered component types.'),
                        ]),
                    Heading::make('Workbench users', 2),
                    Table::use(UsersTable::class),
                ]),
        ]);
    }
}
