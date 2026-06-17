<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search;

use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Lattice\Lattice\Attributes\AsSearchProvider;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Search\Contracts\SearchResultProvider;
use Spatie\Attributes\Attributes;

final class SearchResultProviderRegistry
{
    /** @var array<string, class-string<SearchResultProvider>> */
    private array $registered = [];

    public function __construct(
        private readonly Container $container,
        private readonly DiscoveryManifest $manifest,
    ) {}

    /**
     * @param  class-string<SearchResultProvider>|array<int, class-string<SearchResultProvider>>  $providers
     */
    public function register(string|array $providers): void
    {
        foreach ((array) $providers as $provider) {
            $this->registered[$this->keyFor($provider)] = $provider;
        }
    }

    /** @return array<string, SearchResultProvider> */
    public function all(): array
    {
        /** @var array<string, class-string<SearchResultProvider>> $discovered */
        $discovered = $this->manifest->forGroup('search');

        return array_map(
            fn (string $class): SearchResultProvider => $this->container->make($class),
            array_merge($discovered, $this->registered),
        );
    }

    public function forCategory(string $name): ?SearchResultProvider
    {
        return $this->all()[$name] ?? null;
    }

    /** @return array<string, SearchResultProvider> */
    public function authorized(Request $request): array
    {
        return array_filter(
            $this->all(),
            fn (SearchResultProvider $provider): bool => $provider->authorize($request),
        );
    }

    /**
     * @param  class-string<SearchResultProvider>  $provider
     */
    private function keyFor(string $provider): string
    {
        if (! is_subclass_of($provider, SearchResultProvider::class)) {
            throw new InvalidArgumentException("[{$provider}] must implement ".SearchResultProvider::class.'.');
        }

        $attribute = Attributes::get($provider, AsSearchProvider::class);

        if (! $attribute instanceof AsSearchProvider) {
            throw new InvalidArgumentException("[{$provider}] is missing the #[AsSearchProvider] attribute.");
        }

        return $attribute->key;
    }
}
