<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Core\Components\Chart;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[Fragment('workbench.sales-mix-chart')]
final class SalesMixChartFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Chart::make(__('workbench.pages.charts.sales-mix.title'))
                ->description(__('workbench.pages.charts.sales-mix.description'))
                ->height(220)
                ->data([
                    ['channel' => __('workbench.pages.charts.channels.direct'), 'amount' => 42_000, 'color' => '#2563eb'],
                    ['channel' => __('workbench.pages.charts.channels.partner'), 'amount' => 27_000, 'color' => '#16a34a'],
                    ['channel' => __('workbench.pages.charts.channels.marketplace'), 'amount' => 19_000, 'color' => '#f59e0b'],
                    ['channel' => __('workbench.pages.charts.channels.retail'), 'amount' => 12_000, 'color' => '#dc2626'],
                ])
                ->pie('amount', nameKey: 'channel'),
        );
    }
}
