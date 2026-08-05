<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\StackDirection;
use Lattice\Ui\PageSchema;
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
