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
use Workbench\App\Tables\SalesOrdersTable;

#[AsPage(route: '/sales-orders', name: 'sales-orders.index')]
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
                        ->direction(StackDirection::Row)
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
