<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\Discovery;

use Spatie\StructureDiscoverer\Discover;

/**
 * The single Spatie structure-discoverer entry point used across the package.
 *
 * Construct `Discover` directly instead of `Discover::in()`: the container binding
 * injects a cache driver whose entry is keyed only by directory, which collides
 * with the typescript-transformer discovering the same directory in-process during
 * `lattice:typescript`.
 */
final class ClassWalker
{
    /**
     * Concrete and abstract classes (no enums).
     *
     * @return list<class-string>
     */
    public static function classes(string $path): array
    {
        if (! is_dir($path)) {
            return [];
        }

        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->classes()->get();

        return $classes;
    }

    /**
     * Every discovered structure, including enums (`->classes()` drops them).
     *
     * @return list<class-string>
     */
    public static function all(string $path): array
    {
        if (! is_dir($path)) {
            return [];
        }

        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->get();

        return $classes;
    }
}
