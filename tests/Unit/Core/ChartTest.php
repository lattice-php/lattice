<?php
declare(strict_types=1);

use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Chart;
use Lattice\Lattice\Ui\Enums\DateTimeStyle;
use Lattice\Lattice\Ui\Values\ChartSeries;
use Lattice\Lattice\Ui\Values\DateFormat;
use Lattice\Lattice\Ui\Values\NumberFormat;

it('serializes a cartesian chart with fluent series helpers', function (): void {
    $node = wire(
        Chart::make('Revenue')
            ->description('Monthly recurring revenue')
            ->data([
                ['month' => 'Jan', 'revenue' => 1200, 'orders' => 32, 'forecast' => 1400],
                ['month' => 'Feb', 'revenue' => 1800, 'orders' => 41, 'forecast' => 1900],
            ])
            ->categoryKey('month')
            ->height(280)
            ->line('revenue', 'Revenue', color: '#2563eb')
            ->bar('orders', 'Orders', color: '#16a34a', stackId: 'volume')
            ->area('forecast', 'Forecast', color: '#9333ea', stackId: 'projection')
            ->legend(false)
            ->tooltip(false)
            ->grid(false),
    );

    expect($node['type'])->toBe('chart')
        ->and($node['props'])->toMatchArray([
            'title' => 'Revenue',
            'description' => 'Monthly recurring revenue',
            'categoryKey' => 'month',
            'height' => 280,
            'legend' => false,
            'tooltip' => false,
            'grid' => false,
            'xAxis' => true,
            'yAxis' => true,
        ])
        ->and($node['props']['data'])->toHaveCount(2)
        ->and($node['props']['series'][0])->toMatchArray([
            'type' => 'line',
            'dataKey' => 'revenue',
            'name' => 'Revenue',
            'color' => '#2563eb',
            'stackId' => null,
            'nameKey' => null,
        ])
        ->and($node['props']['series'][1])->toMatchArray([
            'type' => 'bar',
            'dataKey' => 'orders',
            'name' => 'Orders',
            'color' => '#16a34a',
            'stackId' => 'volume',
            'nameKey' => null,
        ])
        ->and($node['props']['series'][2])->toMatchArray([
            'type' => 'area',
            'dataKey' => 'forecast',
            'name' => 'Forecast',
            'color' => '#9333ea',
            'stackId' => 'projection',
            'nameKey' => null,
        ]);
});

it('serializes a pie chart series', function (): void {
    $node = wire(
        Chart::make('Revenue by channel')
            ->data([
                ['channel' => 'Direct', 'amount' => 4200],
                ['channel' => 'Partner', 'amount' => 2600],
            ])
            ->pie('amount', nameKey: 'channel'),
    );

    expect($node['props']['series'])->toHaveCount(1)
        ->and($node['props']['series'][0])->toMatchArray([
            'type' => 'pie',
            'dataKey' => 'amount',
            'name' => 'amount',
            'nameKey' => 'channel',
            'innerRadius' => '0%',
        ]);
});

it('serializes a doughnut series as a pie with an inner radius', function (): void {
    $node = wire(
        Chart::make('Revenue by channel')
            ->data([
                ['channel' => 'Direct', 'amount' => 4200],
                ['channel' => 'Partner', 'amount' => 2600],
            ])
            ->doughnut('amount', nameKey: 'channel'),
    );

    expect($node['props']['series'])->toHaveCount(1)
        ->and($node['props']['series'][0])->toMatchArray([
            'type' => 'pie',
            'dataKey' => 'amount',
            'name' => 'amount',
            'nameKey' => 'channel',
            'innerRadius' => '60%',
        ]);
});

it('serializes explicit axis toggles and configured series arrays', function (): void {
    $node = wire(
        Chart::make(key: 'revenue-chart')
            ->xAxis(false)
            ->yAxis(false)
            ->series([
                ChartSeries::line('revenue'),
            ]),
    );

    expect($node['key'])->toBe('revenue-chart')
        ->and($node['props'])->toMatchArray([
            'title' => null,
            'description' => null,
            'categoryKey' => null,
            'height' => 320,
            'legend' => true,
            'tooltip' => true,
            'grid' => true,
            'xAxis' => false,
            'yAxis' => false,
        ])
        ->and($node['props']['series'])->toHaveCount(1)
        ->and($node['props']['series'][0])->toMatchArray([
            'type' => 'line',
            'dataKey' => 'revenue',
            'name' => 'revenue',
            'color' => null,
            'stackId' => null,
            'nameKey' => null,
            'innerRadius' => '0%',
        ]);
});

it('serializes value and category formats', function (): void {
    $node = wire(
        Chart::make('Revenue')
            ->categoryKey('month')
            ->data([['month' => '2026-01-01', 'revenue' => 28000]])
            ->line('revenue')
            ->categoryFormat(DateFormat::date(DateTimeStyle::Short))
            ->valueFormat(NumberFormat::currency('USD')->compact()),
    );

    expect($node['props']['categoryFormat'])->toBe([
        'kind' => 'date',
        'dateStyle' => 'short',
        'timeStyle' => null,
        'month' => null,
        'year' => null,
    ])->and($node['props']['valueFormat'])->toMatchArray([
        'kind' => 'number',
        'notation' => 'compact',
        'currency' => 'USD',
    ]);
});

it('defaults both formats to null', function (): void {
    $node = wire(Chart::make('Revenue')->data([])->line('revenue'));

    expect($node['props']['categoryFormat'])->toBeNull()
        ->and($node['props']['valueFormat'])->toBeNull();
});

describe('docs fixtures', function (): void {
    it('matches the line chart example fixture', function (): void {
        assertFixtureMatches('charts.line', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Signups', 'signups-chart')
                ->description('New users per month')
                ->categoryKey('month')
                ->data([
                    ['month' => 'Jan', 'free' => 240, 'pro' => 90],
                    ['month' => 'Feb', 'free' => 300, 'pro' => 140],
                    ['month' => 'Mar', 'free' => 280, 'pro' => 180],
                    ['month' => 'Apr', 'free' => 360, 'pro' => 240],
                    ['month' => 'May', 'free' => 420, 'pro' => 320],
                ])
                ->line('free', 'Free')
                ->line('pro', 'Pro')
                ->height(260),
        ]))));
    });

    it('matches the grouped bar chart example fixture', function (): void {
        assertFixtureMatches('charts.grouped-bar', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Orders by channel', 'orders-chart')
                ->categoryKey('week')
                ->data([
                    ['week' => 'W1', 'online' => 120, 'store' => 80],
                    ['week' => 'W2', 'online' => 150, 'store' => 70],
                    ['week' => 'W3', 'online' => 170, 'store' => 90],
                    ['week' => 'W4', 'online' => 210, 'store' => 110],
                ])
                ->bar('online', 'Online')
                ->bar('store', 'In-store')
                ->height(260),
        ]))));
    });

    it('matches the stacked bar chart example fixture', function (): void {
        assertFixtureMatches('charts.stacked-bar', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Monthly recurring revenue', 'mrr-chart')
                ->description('Stacked by revenue type')
                ->categoryKey('month')
                ->data([
                    ['month' => 'Jan', 'new' => 1200, 'expansion' => 300],
                    ['month' => 'Feb', 'new' => 1500, 'expansion' => 450],
                    ['month' => 'Mar', 'new' => 1800, 'expansion' => 600],
                    ['month' => 'Apr', 'new' => 2100, 'expansion' => 780],
                ])
                ->bar('new', 'New', stackId: 'mrr')
                ->bar('expansion', 'Expansion', stackId: 'mrr')
                ->height(260),
        ]))));
    });

    it('matches the composed area and line chart example fixture', function (): void {
        assertFixtureMatches('charts.composed', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Revenue vs forecast', 'revenue-forecast-chart')
                ->description('Actuals as a line over the forecast band')
                ->categoryKey('month')
                ->data([
                    ['month' => 'Jan', 'forecast' => 26_000, 'revenue' => 28_000],
                    ['month' => 'Feb', 'forecast' => 30_000, 'revenue' => 32_000],
                    ['month' => 'Mar', 'forecast' => 34_000, 'revenue' => 36_500],
                    ['month' => 'Apr', 'forecast' => 37_000, 'revenue' => 34_000],
                    ['month' => 'May', 'forecast' => 39_500, 'revenue' => 41_500],
                ])
                ->area('forecast', 'Forecast')
                ->line('revenue', 'Revenue')
                ->height(260),
        ]))));
    });

    it('matches the pie chart example fixture', function (): void {
        assertFixtureMatches('charts.pie', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Revenue by channel', 'channel-mix-chart')
                ->description('Share of total revenue')
                ->data([
                    ['channel' => 'Direct', 'amount' => 42_000, 'color' => '#2563eb'],
                    ['channel' => 'Partner', 'amount' => 27_000, 'color' => '#16a34a'],
                    ['channel' => 'Marketplace', 'amount' => 19_000, 'color' => '#f59e0b'],
                    ['channel' => 'Retail', 'amount' => 12_000, 'color' => '#dc2626'],
                ])
                ->pie('amount', nameKey: 'channel')
                ->height(260),
        ]))));
    });

    it('matches the doughnut chart example fixture', function (): void {
        assertFixtureMatches('charts.doughnut', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Revenue by channel', 'channel-mix-doughnut-chart')
                ->description('Share of total revenue')
                ->data([
                    ['channel' => 'Direct', 'amount' => 42_000, 'color' => '#2563eb'],
                    ['channel' => 'Partner', 'amount' => 27_000, 'color' => '#16a34a'],
                    ['channel' => 'Marketplace', 'amount' => 19_000, 'color' => '#f59e0b'],
                    ['channel' => 'Retail', 'amount' => 12_000, 'color' => '#dc2626'],
                ])
                ->doughnut('amount', nameKey: 'channel')
                ->height(260),
        ]))));
    });

    it('matches the formatting example fixture', function (): void {
        assertFixtureMatches('charts.formatting', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Chart::make('Revenue', 'formatting-chart')
                ->description('Compact currency on the value axis, month labels on the category axis')
                ->categoryKey('month')
                ->data([
                    ['month' => '2026-01-01', 'revenue' => 28000],
                    ['month' => '2026-02-01', 'revenue' => 32000],
                    ['month' => '2026-03-01', 'revenue' => 36500],
                    ['month' => '2026-04-01', 'revenue' => 41500],
                ])
                ->line('revenue', 'Revenue')
                ->categoryFormat(DateFormat::monthYear())
                ->valueFormat(NumberFormat::currency('USD')->compact())
                ->height(260),
        ]))));
    });
});
