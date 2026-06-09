<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Core\Components\Button;
use Bambamboole\Lattice\Core\Components\Heading;
use Bambamboole\Lattice\Core\Components\Stack;
use Bambamboole\Lattice\Core\Gap;
use Bambamboole\Lattice\Pages\Page;
use Bambamboole\Lattice\Pages\PageSchema;
use Bambamboole\Lattice\Tables\Components\Table;
use Workbench\App\Tables\ProductsTable;

class WorkbenchProductsPage extends Page
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
