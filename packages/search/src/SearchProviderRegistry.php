<?php
declare(strict_types=1);

namespace Lattice\Search;

use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Search\Contracts\SearchResultProvider;
use Spatie\Attributes\Attributes;

final class SearchProviderRegistry
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
        $discovered = $this->manifest->forGroup('search-providers');
        $providers = [];

        foreach (array_merge($discovered, $this->registered) as $key => $class) {
            $provider = $this->container->make($class);

            if ($provider->category()->name !== $key) {
                throw new InvalidArgumentException("Search provider [{$class}] must return category [{$key}].");
            }

            $providers[$key] = $provider;
        }

        return $providers;
    }

    public function forCategory(string $category): ?SearchResultProvider
    {
        return $this->all()[$category] ?? null;
    }

    /** @return array<string, SearchResultProvider> */
    public function authorized(Request $request): array
    {
        return array_filter(
            $this->all(),
            fn (SearchResultProvider $provider): bool => $provider->authorize($request),
        );
    }

    /** @param class-string<SearchResultProvider> $provider */
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
