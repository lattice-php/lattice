<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\ProductsTable;

class ProductsPage extends Page
{
    public function title(): string
    {
        return 'Products';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('products-page')
                ->gap(Gap::Large)
                ->children([
                    Stack::make('products-header')
                        ->direction('row')
                        ->align('center')
                        ->children([
                            Heading::make('Products'),
                            Button::make('Create product')
                                ->href('/products/create'),
                        ]),
                    Table::use(ProductsTable::class),
                ]),
        ]);
    }
}
