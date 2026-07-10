<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

final class PageMetadataResolver
{
    /** @var array<string, PageMetadata> */
    private array $metadata = [];

    public function __construct(private readonly DiscoveryManifest $manifest) {}

    public function for(PageContract|string $page): PageMetadata
    {
        $class = is_object($page) ? $page::class : $page;
        $key = $this->cacheKey($class);

        return $this->metadata[$key] ??= $this->resolve($class);
    }

    /**
     * @param  class-string  $class
     */
    private function resolve(string $class): PageMetadata
    {
        if ($this->manifest->isCached()) {
            $descriptor = $this->manifest->descriptorFor($class);

            if ($descriptor !== null) {
                return PageMetadata::fromArray($descriptor);
            }
        }

        return PageMetadata::reflect($class);
    }

    /**
     * @param  class-string  $class
     */
    private function cacheKey(string $class): string
    {
        return $class.'|'.($this->manifest->isCached() ? 'manifest' : 'reflection');
    }
}
