<?php

declare(strict_types=1);

namespace Lattice\Map\Components;

use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Map\CoordinateData;
use Lattice\Map\MapProviderData;
use Lattice\Map\MapProviderRegistry;
use Lattice\Map\Marker;
use Lattice\Map\MarkerData;
use Lattice\Ui\Components\Component;

#[AsComponent('map')]
final class Map extends Component
{
    public MapProviderData $provider;

    public ?CoordinateData $center = null;

    public ?int $zoom = null;

    public int $height = 400;

    public bool $scrollZoom = false;

    public bool $navigationControls = true;

    /** @var list<MarkerData> */
    public array $features = [];

    private ?string $providerName = null;

    /** @var list<Marker> */
    private array $markers = [];

    public static function make(?string $key = null): static
    {
        return new self($key);
    }

    public function provider(string $provider): static
    {
        $provider = trim($provider);

        if ($provider === '') {
            throw new InvalidArgumentException('Map provider must not be empty.');
        }

        $this->providerName = $provider;

        return $this;
    }

    public function center(float $latitude, float $longitude): static
    {
        $this->center = CoordinateData::make($latitude, $longitude);

        return $this;
    }

    public function zoom(int $zoom): static
    {
        if ($zoom < 0 || $zoom > 24) {
            throw new InvalidArgumentException('Map zoom must be between 0 and 24.');
        }

        $this->zoom = $zoom;

        return $this;
    }

    public function height(int $height): static
    {
        if ($height < 160) {
            throw new InvalidArgumentException('Map height must be at least 160 pixels.');
        }

        $this->height = $height;

        return $this;
    }

    public function scrollZoom(bool $enabled = true): static
    {
        $this->scrollZoom = $enabled;

        return $this;
    }

    public function navigationControls(bool $visible = true): static
    {
        $this->navigationControls = $visible;

        return $this;
    }

    /** @param list<Marker> $markers */
    public function markers(array $markers): static
    {
        $this->markers = $markers;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function prepareMap(array $data): array
    {
        $providerName = $this->providerName ?? (string) config('map.default_provider');
        $provider = app(MapProviderRegistry::class)->get($providerName);
        $features = array_map(
            static fn (Marker $marker): MarkerData => $marker->data(),
            $this->markers,
        );

        $ids = array_map(static fn (MarkerData $feature): string => $feature->id, $features);

        if (count($ids) !== count(array_unique($ids))) {
            throw new InvalidArgumentException('Map marker ids must be unique.');
        }

        if (count(array_filter($features, static fn (MarkerData $feature): bool => $feature->open)) > 1) {
            throw new InvalidArgumentException('Only one map marker may be opened initially.');
        }

        $this->provider = $provider->data();
        $this->features = $features;

        if ($this->zoom !== null && ($this->zoom < $this->provider->minimumZoom || $this->zoom > $this->provider->maximumZoom)) {
            throw new InvalidArgumentException("Map zoom must be between {$this->provider->minimumZoom} and {$this->provider->maximumZoom} for provider [{$this->provider->name}].");
        }

        return $data;
    }
}
