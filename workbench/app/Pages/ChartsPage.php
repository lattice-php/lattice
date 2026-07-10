<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Chart;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\NumberFormatUnit;
use Lattice\Lattice\Ui\Values\DateFormat;
use Lattice\Lattice\Ui\Values\NumberFormat;
use Workbench\App\Fragments\OrderVolumeChartFragment;
use Workbench\App\Fragments\RevenueTrendChartFragment;
use Workbench\App\Fragments\SalesMixChartFragment;

#[AsPage(route: '/charts')]
final class ChartsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.charts.gallery.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('charts-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('charts-hero')
                        ->gap(Gap::Large)
                        ->schema([
                            Badge::make(__('workbench.navigation.charts')),
                            Heading::make(__('workbench.pages.charts.gallery.heading')),
                            Text::make(__('workbench.pages.charts.gallery.intro')),
                        ]),
                    Heading::make(__('workbench.pages.charts.gallery.sections.series-types'), 2),
                    Grid::make('charts-series-types')
                        ->columns(2)
                        ->schema([
                            $this->signupsLineChart(),
                            $this->ordersBarChart(),
                            $this->trafficAreaChart(),
                            Fragment::lazy(SalesMixChartFragment::class),
                        ]),
                    Heading::make(__('workbench.pages.charts.gallery.sections.combining'), 2),
                    Grid::make('charts-combining')
                        ->columns(2)
                        ->schema([
                            Fragment::lazy(OrderVolumeChartFragment::class),
                            Fragment::lazy(RevenueTrendChartFragment::class),
                        ]),
                    Heading::make(__('workbench.pages.charts.gallery.sections.formatting'), 2),
                    Grid::make('charts-formatting')
                        ->columns(2)
                        ->schema([
                            $this->revenueFormattingChart(),
                            $this->conversionPercentChart(),
                        ]),
                ]),
        ]);
    }

    private function signupsLineChart(): Chart
    {
        return Chart::make(__('workbench.pages.charts.gallery.signups.title'))
            ->description(__('workbench.pages.charts.gallery.signups.description'))
            ->categoryKey('month')
            ->height(240)
            ->data([
                ['month' => '2026-01-01', 'free' => 240, 'pro' => 90],
                ['month' => '2026-02-01', 'free' => 300, 'pro' => 140],
                ['month' => '2026-03-01', 'free' => 280, 'pro' => 180],
                ['month' => '2026-04-01', 'free' => 360, 'pro' => 240],
                ['month' => '2026-05-01', 'free' => 420, 'pro' => 320],
                ['month' => '2026-06-01', 'free' => 470, 'pro' => 380],
            ])
            ->line('free', __('workbench.pages.charts.gallery.signups.free'))
            ->line('pro', __('workbench.pages.charts.gallery.signups.pro'))
            ->categoryFormat(DateFormat::month());
    }

    private function ordersBarChart(): Chart
    {
        return Chart::make(__('workbench.pages.charts.gallery.orders.title'))
            ->description(__('workbench.pages.charts.gallery.orders.description'))
            ->categoryKey('week')
            ->height(240)
            ->data([
                ['week' => __('workbench.pages.charts.weeks.week-1'), 'online' => 120, 'store' => 80],
                ['week' => __('workbench.pages.charts.weeks.week-2'), 'online' => 150, 'store' => 70],
                ['week' => __('workbench.pages.charts.weeks.week-3'), 'online' => 170, 'store' => 90],
                ['week' => __('workbench.pages.charts.weeks.week-4'), 'online' => 210, 'store' => 110],
            ])
            ->bar('online', __('workbench.pages.charts.gallery.orders.online'))
            ->bar('store', __('workbench.pages.charts.gallery.orders.store'));
    }

    private function trafficAreaChart(): Chart
    {
        return Chart::make(__('workbench.pages.charts.gallery.traffic.title'))
            ->description(__('workbench.pages.charts.gallery.traffic.description'))
            ->categoryKey('month')
            ->height(240)
            ->data([
                ['month' => '2026-01-01', 'visits' => 4200],
                ['month' => '2026-02-01', 'visits' => 4800],
                ['month' => '2026-03-01', 'visits' => 5300],
                ['month' => '2026-04-01', 'visits' => 5100],
                ['month' => '2026-05-01', 'visits' => 6200],
                ['month' => '2026-06-01', 'visits' => 6900],
            ])
            ->area('visits', __('workbench.pages.charts.gallery.traffic.visits'))
            ->categoryFormat(DateFormat::month());
    }

    private function revenueFormattingChart(): Chart
    {
        return Chart::make(__('workbench.pages.charts.gallery.formatting.title'))
            ->description(__('workbench.pages.charts.gallery.formatting.description'))
            ->categoryKey('month')
            ->height(240)
            ->data([
                ['month' => '2026-01-01', 'revenue' => 28000],
                ['month' => '2026-02-01', 'revenue' => 32000],
                ['month' => '2026-03-01', 'revenue' => 36500],
                ['month' => '2026-04-01', 'revenue' => 41500],
                ['month' => '2026-05-01', 'revenue' => 45000],
                ['month' => '2026-06-01', 'revenue' => 52000],
            ])
            ->line('revenue', __('workbench.pages.charts.gallery.formatting.revenue'))
            ->categoryFormat(DateFormat::monthYear())
            ->valueFormat(NumberFormat::currency('USD')->compact());
    }

    private function conversionPercentChart(): Chart
    {
        return Chart::make(__('workbench.pages.charts.gallery.conversion.title'))
            ->description(__('workbench.pages.charts.gallery.conversion.description'))
            ->categoryKey('month')
            ->height(240)
            ->data([
                ['month' => '2026-01-01', 'rate' => 3.2],
                ['month' => '2026-02-01', 'rate' => 3.8],
                ['month' => '2026-03-01', 'rate' => 4.1],
                ['month' => '2026-04-01', 'rate' => 3.9],
                ['month' => '2026-05-01', 'rate' => 4.6],
                ['month' => '2026-06-01', 'rate' => 5.0],
            ])
            ->bar('rate', __('workbench.pages.charts.gallery.conversion.rate'))
            ->categoryFormat(DateFormat::month())
            ->valueFormat(NumberFormat::make()->unit(NumberFormatUnit::Percent)->decimals(1));
    }
}
