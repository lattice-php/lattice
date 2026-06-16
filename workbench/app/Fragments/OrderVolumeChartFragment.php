<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Core\Components\Chart;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[Fragment('workbench.order-volume-chart')]
final class OrderVolumeChartFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Chart::make(__('workbench.pages.charts.order-volume.title'))
                ->description(__('workbench.pages.charts.order-volume.description'))
                ->height(280)
                ->categoryKey('week')
                ->data([
                    ['week' => 'W1', 'draft' => 18, 'placed' => 44],
                    ['week' => 'W2', 'draft' => 22, 'placed' => 51],
                    ['week' => 'W3', 'draft' => 16, 'placed' => 48],
                    ['week' => 'W4', 'draft' => 25, 'placed' => 57],
                    ['week' => 'W5', 'draft' => 21, 'placed' => 63],
                    ['week' => 'W6', 'draft' => 19, 'placed' => 59],
                ])
                ->bar('draft', __('workbench.pages.charts.order-volume.draft'), color: '#f59e0b', stackId: 'orders')
                ->bar('placed', __('workbench.pages.charts.order-volume.placed'), color: '#16a34a', stackId: 'orders'),
        );
    }
}
