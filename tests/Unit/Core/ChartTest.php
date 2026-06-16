<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Chart;
use Lattice\Lattice\Core\Values\ChartSeries;

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
            'nameKey' => 'channel',
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
            'name' => null,
            'color' => null,
            'stackId' => null,
            'nameKey' => null,
        ]);
});
