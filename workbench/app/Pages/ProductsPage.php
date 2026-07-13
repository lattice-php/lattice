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
use Lattice\Lattice\Ui\Enums\StackDirection;
use Workbench\App\Tables\ProductsTable;

#[AsPage(route: '/products', name: 'products.index')]
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
                        ->direction(StackDirection::Row)
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
