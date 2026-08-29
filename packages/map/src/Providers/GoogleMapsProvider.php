<?php

declare(strict_types=1);

namespace Lattice\Map\Providers;

use Illuminate\Contracts\Config\Repository;
use InvalidArgumentException;
use Lattice\Map\Contracts\MapProvider;
use Lattice\Map\MapProviderData;

final readonly class GoogleMapsProvider implements MapProvider
{
    public function __construct(private Repository $config) {}

    public function data(): MapProviderData
    {
        $apiKey = $this->string('map.providers.googlemaps.api_key');
        $mapId = $this->string('map.providers.googlemaps.map_id');
        $minimumZoom = $this->integer('map.providers.googlemaps.minimum_zoom');
        $maximumZoom = $this->integer('map.providers.googlemaps.maximum_zoom');

        return new MapProviderData(
            name: 'googlemaps',
            options: [
                'apiKey' => $apiKey,
                'mapId' => $mapId,
            ],
            minimumZoom: $minimumZoom,
            maximumZoom: $maximumZoom,
        );
    }

    private function string(string $key): string
    {
        $value = $this->config->get($key);

        if (! is_string($value) || trim($value) === '') {
            throw new InvalidArgumentException("Map configuration [{$key}] must be a non-empty string.");
        }

        return $value;
    }

    private function integer(string $key): int
    {
        $value = $this->config->get($key);

        if (! is_int($value)) {
            throw new InvalidArgumentException("Map configuration [{$key}] must be an integer.");
        }

        return $value;
    }
}
