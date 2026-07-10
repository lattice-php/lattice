<?php
declare(strict_types=1);

namespace Workbench\App\Fragments;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Ui\Components\Chart;
use Lattice\Lattice\Ui\Values\DateFormat;

#[AsFragment('workbench.revenue-trend-chart')]
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
                    ['month' => '2026-01-01', 'revenue' => 28_000, 'forecast' => 26_000],
                    ['month' => '2026-02-01', 'revenue' => 32_000, 'forecast' => 30_000],
                    ['month' => '2026-03-01', 'revenue' => 36_500, 'forecast' => 34_000],
                    ['month' => '2026-04-01', 'revenue' => 34_000, 'forecast' => 37_000],
                    ['month' => '2026-05-01', 'revenue' => 41_500, 'forecast' => 39_500],
                    ['month' => '2026-06-01', 'revenue' => 45_000, 'forecast' => 43_000],
                ])
                ->area('forecast', __('workbench.pages.charts.revenue.forecast'), color: '#8b5cf6')
                ->line('revenue', __('workbench.pages.charts.revenue.actual'), color: '#2563eb')
                ->categoryFormat(DateFormat::month()),
        );
    }
}
