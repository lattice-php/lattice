<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Enums\ColorName;
use Lattice\Map\Components\Map;
use Lattice\Map\Marker;
use Lattice\Map\Route;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/map')]
final class MapPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.navigation.map');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('map-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.map.heading')),
                    Text::make(__('workbench.pages.map.description')),
                    Map::make('offices')
                        ->center(52.47, 13.24)
                        ->zoom(10)
                        ->height(600)
                        ->routes([
                            Route::make('commute')
                                ->path([
                                    [52.5208, 13.4095],
                                    [52.5063, 13.3320],
                                    [52.4581, 13.2107],
                                    [52.4009, 13.0591],
                                ])
                                ->color(ColorName::Info)
                                ->weight(4),
                        ])
                        ->markers([
                            Marker::make('berlin')
                                ->position(52.5208, 13.4095)
                                ->label(__('workbench.pages.map.berlin.label'))
                                ->popup([
                                    Stack::make('berlin-popup')->gap(Gap::Small)->schema([
                                        Heading::make(__('workbench.pages.map.berlin.heading'), 3),
                                        Text::make(__('workbench.pages.map.berlin.description')),
                                        Link::make(__('workbench.pages.map.open-in-openstreetmap'))
                                            ->href('https://www.openstreetmap.org/?mlat=52.5208&mlon=13.4095#map=16/52.5208/13.4095'),
                                    ]),
                                ])
                                ->open(),
                            Marker::make('potsdam')
                                ->position(52.4009, 13.0591)
                                ->icon(Icon::Bell)
                                ->color(ColorName::Warning)
                                ->label(__('workbench.pages.map.potsdam.label'))
                                ->popup([
                                    Stack::make('potsdam-popup')->gap(Gap::Small)->schema([
                                        Heading::make(__('workbench.pages.map.potsdam.heading'), 3),
                                        Text::make(__('workbench.pages.map.potsdam.description')),
                                    ]),
                                ]),
                        ]),
                    ...$this->googleMaps(),
                ]),
        ]);
    }

    /** @return list<Component> */
    private function googleMaps(): array
    {
        if (blank(config('map.providers.googlemaps.api_key'))) {
            return [];
        }

        return [
            Heading::make(__('workbench.pages.map.googlemaps.heading'), 2),
            Text::make(__('workbench.pages.map.googlemaps.description')),
            Map::make('offices-googlemaps')
                ->provider('googlemaps')
                ->height(600)
                ->routes([
                    Route::make('commute')
                        ->path([
                            [52.5208, 13.4095],
                            [52.5063, 13.3320],
                            [52.4581, 13.2107],
                            [52.4009, 13.0591],
                        ])
                        ->color(ColorName::Info)
                        ->weight(4),
                ])
                ->markers([
                    Marker::make('berlin')
                        ->position(52.5208, 13.4095)
                        ->label(__('workbench.pages.map.berlin.label'))
                        ->popup([
                            Stack::make('berlin-google-popup')->gap(Gap::Small)->schema([
                                Heading::make(__('workbench.pages.map.berlin.heading'), 3),
                                Text::make(__('workbench.pages.map.berlin.description')),
                            ]),
                        ])
                        ->open(),
                    Marker::make('potsdam')
                        ->position(52.4009, 13.0591)
                        ->icon(Icon::Bell)
                        ->color(ColorName::Warning)
                        ->label(__('workbench.pages.map.potsdam.label')),
                ]),
        ];
    }
}
