<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;

/**
 * The detail revealed when a sales-order row expands: the order's line items,
 * loaded lazily over AJAX from the row's `orderId` context.
 */
#[AsFragment('workbench.sales-order-lines')]
final class SalesOrderLinesFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        $order = SalesOrder::query()->with('lines.product')->find((int) $this->context('orderId'));

        if ($order === null) {
            return $schema->component(Text::make(__('workbench.commerce.sales-orders.detail.missing')));
        }

        $lines = $order->lines
            ->map(fn (SalesOrderLine $line): Text => Text::make(
                $line->quantity.' × '.$line->product->name.' — '.$line->total(),
            ))
            ->all();

        if ($lines === []) {
            $lines = [Text::make(__('workbench.commerce.sales-orders.detail.empty'))];
        }

        return $schema->component(
            Stack::make('sales-order-lines-'.$order->getKey())->gap(Gap::Small)->schema($lines),
        );
    }
}
