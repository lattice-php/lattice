<?php

declare(strict_types=1);

namespace Lattice\Lattice\Pages;

use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\PageMetadata;
use ReflectionClass;

final class PageRegistry
{
    /** @var array<class-string, class-string> */
    private array $registered = [];

    public function __construct(private readonly DiscoveryManifest $manifest) {}

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
     * @return array<int, PageMetadata>
     */
    public function all(): array
    {
        $pages = [];

        foreach ($this->manifest->pageDescriptors() as $descriptor) {
            $pages[$descriptor['class']] = PageMetadata::fromArray($descriptor);
        }

        foreach ($this->registered as $page) {
            if (isset($pages[$page])) {
                continue;
            }

            if (! is_a($page, PageContract::class, true) || (new ReflectionClass($page))->isAbstract()) {
                continue;
            }

            $metadata = PageMetadata::reflect($page);

            if ($metadata->route !== null) {
                $pages[$page] = $metadata;
            }
        }

        return array_values($pages);
    }
}
