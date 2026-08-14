<?php

declare(strict_types=1);

namespace Lattice\Map;

use InvalidArgumentException;
use Lattice\Map\Contracts\MapProvider;

final class MapProviderRegistry
{
    /** @var array<string, MapProvider> */
    private array $providers = [];

    public function register(MapProvider $provider): void
    {
        $data = $provider->data();
        $this->providers[$data->name] = $provider;
    }

    public function get(string $name): MapProvider
    {
        if (! isset($this->providers[$name])) {
            $available = implode(', ', array_keys($this->providers));
            $suffix = $available === '' ? '' : " Available providers: {$available}.";

            throw new InvalidArgumentException("Map provider [{$name}] is not registered.{$suffix}");
        }

        return $this->providers[$name];
    }
}
