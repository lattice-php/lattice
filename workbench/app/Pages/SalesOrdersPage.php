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
use Workbench\App\Tables\SalesOrdersTable;

#[Page(route: '/sales-orders', name: 'sales-orders.index')]
class SalesOrdersPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.sales-orders.pages.index.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('sales-orders-page')
                ->gap(Gap::Large)
                ->schema([
                    Stack::make('sales-orders-header')
                        ->direction('row')
                        ->align(Align::Center)
                        ->schema([
                            Heading::make(__('workbench.commerce.sales-orders.pages.index.heading')),
                            Button::make(__('workbench.commerce.sales-orders.pages.index.create'), 'create-sales-order')
                                ->href('/sales-orders/create'),
                        ]),
                    Table::use(SalesOrdersTable::class),
                ]),
        ]);
    }
}
