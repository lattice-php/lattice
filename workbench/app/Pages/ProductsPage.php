<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\ProductsTable;

#[Page(route: '/products', name: 'products.index')]
class ProductsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.products.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('products-page')
                ->gap(Gap::Large)
                ->schema([
                    Stack::make('products-header')
                        ->direction('row')
                        ->align(Align::Center)
                        ->schema([
                            Heading::make(__('workbench.pages.products.heading')),
                            Button::make(__('workbench.pages.products.create'), 'create-product')
                                ->href('/products/create'),
                        ]),
                    Table::use(ProductsTable::class),
                ]),
        ]);
    }
}
