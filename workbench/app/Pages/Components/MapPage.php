<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Map\Components\Map;
use Lattice\Map\Marker;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
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
                                ->label(__('workbench.pages.map.potsdam.label'))
                                ->popup([
                                    Stack::make('potsdam-popup')->gap(Gap::Small)->schema([
                                        Heading::make(__('workbench.pages.map.potsdam.heading'), 3),
                                        Text::make(__('workbench.pages.map.potsdam.description')),
                                    ]),
                                ]),
                        ]),
                ]),
        ]);
    }
}
