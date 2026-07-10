<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

final class PageMetadataResolver
{
    /** @var array<string, PageMetadata> */
    private array $metadata = [];

    private ?bool $manifestCached = null;

    public function __construct(private readonly DiscoveryManifest $manifest) {}

    public function for(PageContract|string $page): PageMetadata
    {
        $class = is_object($page) ? $page::class : $page;

        return $this->metadata[$class] ??= $this->resolve($class);
    }

    /**
     * @param  class-string  $class
     */
    private function resolve(string $class): PageMetadata
    {
        if ($this->manifestIsCached()) {
            $descriptor = $this->manifest->descriptorFor($class);

            if ($descriptor !== null) {
                return PageMetadata::fromArray($descriptor);
            }
        }

        return PageMetadata::reflect($class);
    }

    private function manifestIsCached(): bool
    {
        return $this->manifestCached ??= $this->manifest->isCached();
    }
}
