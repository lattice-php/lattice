<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\PageMetadata;
use Lattice\Lattice\Core\PageMetadataResolver;
use ReflectionClass;

final class PageRegistry
{
    /** @var array<class-string, class-string> */
    private array $registered = [];

    public function __construct(
        private readonly DiscoveryManifest $manifest,
        private readonly PageMetadataResolver $metadata,
    ) {}

    /**
     * @param  class-string|array<int, class-string>  $pages
     */
    public function register(string|array $pages): void
    {
        foreach ((array) $pages as $page) {
            $this->registered[$page] = $page;
        }
    }

    /**
     * Every discovered and registered page, routed or not — a route-less
     * `#[AsPage]` is a valid embedded page, so it belongs here; callers that
     * only want routable pages (e.g. route registration) filter on `route`.
     *
     * @return array<int, PageMetadata>
     */
    public function all(): array
    {
        $pages = [];

        foreach ($this->manifest->pageDescriptors() as $descriptor) {
            $pages[$descriptor['class']] = $this->metadata->for($descriptor['class']);
        }

        foreach ($this->registered as $page) {
            if (isset($pages[$page])) {
                continue;
            }

            if (! is_a($page, PageContract::class, true) || new ReflectionClass($page)->isAbstract()) {
                continue;
            }

            $pages[$page] = $this->metadata->for($page);
        }

        return array_values($pages);
    }
}
