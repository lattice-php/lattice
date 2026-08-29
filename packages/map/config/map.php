<?php

declare(strict_types=1);

return [
    'default_provider' => 'openstreetmap',

    'providers' => [
        'openstreetmap' => [
            'tile_url' => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            'minimum_zoom' => 1,
            'maximum_zoom' => 19,
        ],

        'googlemaps' => [
            'api_key' => env('GOOGLE_MAPS_API_KEY'),
            'map_id' => env('GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID'),
            'minimum_zoom' => 0,
            'maximum_zoom' => 22,
        ],
    ],
];
