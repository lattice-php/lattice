<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Lang;
use Lattice\Core\Enums\ColorName;
use Lattice\Map\Components\Map;
use Lattice\Map\Contracts\MapProvider;
use Lattice\Map\MapProviderData;
use Lattice\Map\MapProviderRegistry;
use Lattice\Map\Marker;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Icon;

it('serializes provider-neutral map data with marker popup schemas', function (): void {
    config()->set('map.providers.openstreetmap.tile_url', 'https://tiles.example.test/{z}/{x}/{y}.png');

    $node = wire(
        Map::make('offices')
            ->center(52.52, 13.405)
            ->zoom(12)
            ->height(480)
            ->scrollZoom()
            ->markers([
                Marker::make('berlin')
                    ->position(52.52, 13.405)
                    ->label('Berlin office')
                    ->icon(Icon::Bell)
                    ->color(ColorName::Warning)
                    ->popup([
                        Heading::make('Berlin office'),
                        Text::make('Alexanderplatz 1'),
                    ])
                    ->open(),
            ]),
    );

    expect($node)->toMatchArray(['type' => 'map', 'key' => 'offices'])
        ->and($node['props']['provider'])->toMatchArray([
            'name' => 'openstreetmap',
            'minimumZoom' => 1,
            'maximumZoom' => 19,
        ])
        ->and($node['props']['provider']['options']['tileUrl'])->toBe('https://tiles.example.test/{z}/{x}/{y}.png')
        ->and($node['props'])->toMatchArray([
            'center' => ['latitude' => 52.52, 'longitude' => 13.405],
            'zoom' => 12,
            'height' => 480,
            'scrollZoom' => true,
            'navigationControls' => true,
        ])
        ->and($node['props']['features'][0])->toMatchArray([
            'type' => 'marker',
            'id' => 'berlin',
            'position' => ['latitude' => 52.52, 'longitude' => 13.405],
            'label' => 'Berlin office',
            'open' => true,
            'icon' => 'bell',
            'color' => ['kind' => 'named', 'value' => 'warning', 'dark' => null],
        ])
        ->and(array_column($node['props']['features'][0]['schema'], 'type'))->toBe(['heading', 'text']);
});

it('resolves an application-registered provider without changing the map component', function (): void {
    app(MapProviderRegistry::class)->register(new class implements MapProvider
    {
        public function data(): MapProviderData
        {
            return new MapProviderData(
                name: 'custom',
                options: ['style' => 'satellite'],
                minimumZoom: 0,
                maximumZoom: 22,
            );
        }
    });

    $node = wire(Map::make()->provider('custom')->zoom(21));

    expect($node['props']['provider'])->toBe([
        'name' => 'custom',
        'options' => ['style' => 'satellite'],
        'minimumZoom' => 0,
        'maximumZoom' => 22,
    ]);
});

it('rejects ambiguous initial popup state', function (): void {
    wire(Map::make()->markers([
        Marker::make('one')->position(1, 1)->popup([Text::make('One')])->open(),
        Marker::make('two')->position(2, 2)->popup([Text::make('Two')])->open(),
    ]));
})->throws(InvalidArgumentException::class, 'Only one map marker may be opened initially.');

it('rejects invalid coordinates', function (float $latitude, float $longitude): void {
    Marker::make('invalid')->position($latitude, $longitude);
})->with([
    'latitude below the earth' => [-91, 0],
    'latitude above the earth' => [91, 0],
    'longitude below the earth' => [0, -181],
    'longitude above the earth' => [0, 181],
])->throws(InvalidArgumentException::class);

it('rejects zoom outside the active provider range', function (): void {
    wire(Map::make()->zoom(20));
})->throws(InvalidArgumentException::class, 'Map zoom must be between 1 and 19 for provider [openstreetmap].');

it('serves both bundled map locales', function (): void {
    expect(__('map::map.loading'))->toBe('Loading map…');

    Lang::setLocale('de');

    expect(__('map::map.loading'))->toBe('Karte wird geladen…');
});
