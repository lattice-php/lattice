<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Core\Components\Chart;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;

#[Fragment('workbench.revenue-trend-chart')]
final class RevenueTrendChartFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Chart::make(__('workbench.pages.charts.revenue.title'))
                ->description(__('workbench.pages.charts.revenue.description'))
                ->height(220)
                ->categoryKey('month')
                ->data([
                    ['month' => __('workbench.pages.charts.months.jan'), 'revenue' => 28_000, 'forecast' => 26_000],
                    ['month' => __('workbench.pages.charts.months.feb'), 'revenue' => 32_000, 'forecast' => 30_000],
                    ['month' => __('workbench.pages.charts.months.mar'), 'revenue' => 36_500, 'forecast' => 34_000],
                    ['month' => __('workbench.pages.charts.months.apr'), 'revenue' => 34_000, 'forecast' => 37_000],
                    ['month' => __('workbench.pages.charts.months.may'), 'revenue' => 41_500, 'forecast' => 39_500],
                    ['month' => __('workbench.pages.charts.months.jun'), 'revenue' => 45_000, 'forecast' => 43_000],
                ])
                ->area('forecast', __('workbench.pages.charts.revenue.forecast'), color: '#8b5cf6')
                ->line('revenue', __('workbench.pages.charts.revenue.actual'), color: '#2563eb'),
        );
    }
}
