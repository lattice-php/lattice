<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\Filesystem;
use Lattice\Lattice\Core\PageMetadata;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionClass;
use Spatie\Attributes\Attributes;

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
     * @return array<string, mixed>|null
     */
    public function descriptorFor(string $class): ?array
    {
        /** @var array<class-string, array<string, mixed>> $pages */
        $pages = $this->resolve()['pages'] ?? [];

        return $pages[$class] ?? null;
    }

    public function isCached(): bool
    {
        return $this->files->exists($this->path());
    }

    public function path(): string
    {
        return $this->app->bootstrapPath('cache/lattice.php');
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

        if (! is_array($configured)) {
            return [];
        }

        return array_values(array_filter($configured, 'is_string'));
    }

    /** @return array<string, mixed> */
    public function build(): array
    {
        $manifest = ['pages' => []];

        foreach (array_keys(DiscoveryKinds::COMPONENTS) as $group) {
            $manifest[$group] = [];
        }

        foreach (self::configuredPaths() as $path) {
            foreach (ClassWalker::classes($path) as $class) {
                if ((new ReflectionClass($class))->isAbstract()) {
                    continue;
                }

                foreach (DiscoveryKinds::COMPONENTS as $group => $attribute) {
                    if (Attributes::has($class, $attribute)) {
                        $manifest[$group][DiscoveryKinds::keyOf($class, $attribute)] = $class;
                    }
                }

                if (Attributes::has($class, DiscoveryKinds::PAGE_ATTRIBUTE)) {
                    $metadata = PageMetadata::reflect($class);

                    if ($metadata->route !== null) {
                        $manifest['pages'][$class] = $metadata->toArray();
                    }
                }
            }
        }

        return $manifest;
    }
}
