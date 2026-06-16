<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\SalesOrderForm;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;

#[AsPage(route: '/sales-orders/{salesOrder}/edit')]
class SalesOrderEditPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.commerce.sales-orders.pages.edit.title');
    }

    public function render(PageSchema $schema, SalesOrder $salesOrder): PageSchema
    {
        $salesOrder->load('lines');

        $lines = $salesOrder->lines->map(fn (SalesOrderLine $line): array => [
            'id' => (string) $line->getKey(),
            'product_id' => (string) $line->product_id,
            'quantity' => (string) $line->quantity,
            'unit_price' => $line->unit_price,
        ])->all();

        return $schema->schema([
            Stack::make('sales-order-edit-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.commerce.sales-orders.pages.edit.heading')),
                    Form::use(SalesOrderForm::class)
                        ->method(HttpMethod::Patch)
                        ->submitLabel(__('workbench.commerce.sales-orders.pages.edit.submit'))
                        ->fill([
                            'business_partner_id' => (string) $salesOrder->business_partner_id,
                            'status' => $salesOrder->status->value,
                            'shipping_address_id' => $salesOrder->shipping_address_id !== null
                                ? (string) $salesOrder->shipping_address_id
                                : null,
                            'billing_address_id' => $salesOrder->billing_address_id !== null
                                ? (string) $salesOrder->billing_address_id
                                : null,
                            'lines' => $lines,
                        ])
                        ->context([
                            'sales_order_id' => $salesOrder->getKey(),
                        ]),
                ]),
        ]);
    }
}
