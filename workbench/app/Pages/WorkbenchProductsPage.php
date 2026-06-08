<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Components\Core\Button;
use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Table\Table;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
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
