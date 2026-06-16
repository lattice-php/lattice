<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Core\Components\Chart;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[AsFragment('workbench.order-volume-chart')]
final class OrderVolumeChartFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Chart::make(__('workbench.pages.charts.order-volume.title'))
                ->description(__('workbench.pages.charts.order-volume.description'))
                ->height(220)
                ->categoryKey('week')
                ->data([
                    ['week' => __('workbench.pages.charts.weeks.week-1'), 'draft' => 18, 'placed' => 44],
                    ['week' => __('workbench.pages.charts.weeks.week-2'), 'draft' => 22, 'placed' => 51],
                    ['week' => __('workbench.pages.charts.weeks.week-3'), 'draft' => 16, 'placed' => 48],
                    ['week' => __('workbench.pages.charts.weeks.week-4'), 'draft' => 25, 'placed' => 57],
                    ['week' => __('workbench.pages.charts.weeks.week-5'), 'draft' => 21, 'placed' => 63],
                    ['week' => __('workbench.pages.charts.weeks.week-6'), 'draft' => 19, 'placed' => 59],
                ])
                ->bar('draft', __('workbench.pages.charts.order-volume.draft'), color: '#f59e0b', stackId: 'orders')
                ->bar('placed', __('workbench.pages.charts.order-volume.placed'), color: '#16a34a', stackId: 'orders'),
        );
    }
}
