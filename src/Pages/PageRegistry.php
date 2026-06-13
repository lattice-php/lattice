<?php

declare(strict_types=1);

namespace Lattice\Lattice\Pages;

use Lattice\Lattice\Attributes\Page as PageAttribute;
use Lattice\Lattice\Core\Contracts\Discoverable;
use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;
use Lattice\Lattice\Http\PageContract;
use Lattice\Lattice\Http\PageMetadata;
use ReflectionClass;

/**
 * Collects page classes from explicit registration, configuration, and
 * discovery. It does not register routes itself — the service provider reads
 * `all()` and binds the routes, so the routing happens in one visible place.
 */
final class PageRegistry implements Discoverable
{
    /** @var array<class-string, class-string> */
    private array $registered = [];

    private bool $sourcesLoaded = false;

    public function __construct(private readonly DiscoversDefinitions $discovery) {}

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
     * @param  array<int, class-string>  $definitions
     */
    public function registerDiscovered(array $definitions): void
    {
        $this->register($definitions);
    }

    public function attributeClass(): string
    {
        return PageAttribute::class;
    }

    public function group(): string
    {
        return 'pages';
    }

    /**
     * Every routable page — explicitly registered, configured, and discovered
     * under the configured paths — resolved to its route metadata. Discovery
     * runs lazily the first time this is called.
     *
     * @return array<int, PageMetadata>
     */
    public function all(): array
    {
        $this->loadSources();

        $pages = [];

        foreach ($this->registered as $page) {
            if (! is_a($page, PageContract::class, true) || (new ReflectionClass($page))->isAbstract()) {
                continue;
            }

            $metadata = PageMetadata::for($page);

            if ($metadata->route !== null) {
                $pages[] = $metadata;
            }
        }

        return $pages;
    }

    private function loadSources(): void
    {
        if ($this->sourcesLoaded) {
            return;
        }

        $this->sourcesLoaded = true;

        $configured = config('lattice.pages.registered', []);

        if (is_array($configured)) {
            $this->register($configured);
        }

        foreach (DefinitionDiscovery::configuredPaths() as $path => $namespace) {
            $discovered = $this->discovery->discover($path, $namespace, [$this]);
            $this->register($discovered[$this->group()] ?? []);
        }
    }
}
