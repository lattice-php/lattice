<?php

declare(strict_types=1);

namespace Lattice\Core\Discovery;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\Filesystem;
use Lattice\Core\Contracts\PageContract;
use Lattice\Core\PageMetadata;
use Lattice\Core\Support\Discovery\ClassWalker;
use ReflectionClass;
use Spatie\Attributes\Attributes;
use Throwable;

final class DiscoveryManifest
{
    /** @var array<string, mixed>|null */
    private ?array $resolved = null;

    public function __construct(
        private readonly Application $app,
        private readonly Filesystem $files,
    ) {}

    /** @return array<string, mixed> */
    public function resolve(): array
    {
        return $this->resolved ??= $this->isCached() ? require $this->path() : $this->build();
    }

    /** @return array<string, mixed> */
    public function forGroup(string $group): array
    {
        return $this->resolve()[$group] ?? [];
    }

    /** @return list<array<string, mixed>> */
    public function pageDescriptors(): array
    {
        /** @var array<class-string, array<string, mixed>> $pages */
        $pages = $this->resolve()['pages'] ?? [];

        return array_values($pages);
    }

    /**
     * @param  class-string  $class
     * @return array{class: class-string, route: string|null, name: string, middleware: array<int, string>|null, layout: string, container: string, can?: array<int, string>}|null
     */
    public function descriptorFor(string $class): ?array
    {
        /** @var array<class-string, array{class: class-string, route: string|null, name: string, middleware: array<int, string>|null, layout: string, container: string, can?: array<int, string>}> $pages */
        $pages = $this->resolve()['pages'] ?? [];

        return $pages[$class] ?? null;
    }

    public function isCached(): bool
    {
        return $this->files->exists($this->path());
    }

    public function path(): string
    {
        $configured = config('lattice.discovery.cache_path');

        return is_string($configured) && $configured !== ''
            ? $configured
            : $this->app->bootstrapPath('cache/lattice.php');
    }

    public function cache(): void
    {
        $manifest = $this->build();

        $this->files->put($this->path(), '<?php return '.var_export($manifest, true).';'.PHP_EOL);

        $this->resolved = $manifest;
    }

    public function clear(): void
    {
        if ($this->isCached()) {
            $this->files->delete($this->path());
        }

        $this->resolved = null;
    }

    /** @return list<string> */
    public static function configuredPaths(): array
    {
        $configured = config('lattice.discover', []);
        $configured = is_array($configured)
            ? array_values(array_filter($configured, is_string(...)))
            : [];

        return array_values(array_unique([...$configured, ...ComponentPackages::discoverRoots()]));
    }

    /** @return array<string, mixed> */
    public function build(): array
    {
        $manifest = ['pages' => []];
        $groups = DiscoveryKinds::components();

        foreach (array_keys($groups) as $group) {
            $manifest[$group] = [];
        }

        foreach (self::configuredPaths() as $path) {
            foreach (ClassWalker::classes($path) as $class) {
                try {
                    $abstract = new ReflectionClass($class)->isAbstract();
                } catch (Throwable) {
                    // A discovered class can fail to autoload when it depends on an
                    // optional (e.g. require-dev) package that isn't installed in the
                    // consuming app — e.g. Lattice's own Testbench-based test
                    // scaffolding. It can't carry a discoverable attribute either
                    // way, so skip it rather than fatal.
                    continue;
                }

                if ($abstract) {
                    continue;
                }

                foreach ($groups as $group => $attribute) {
                    if (Attributes::has($class, $attribute)) {
                        $manifest[$group][DiscoveryKinds::keyOf($class, $attribute)] = $class;
                    }
                }

                if (Attributes::has($class, DiscoveryKinds::PAGE_ATTRIBUTE) && is_subclass_of($class, PageContract::class)) {
                    $manifest['pages'][$class] = PageMetadata::reflect($class)->toArray();
                }
            }
        }

        return $manifest;
    }
}
