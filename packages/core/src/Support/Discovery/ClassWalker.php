<?php
declare(strict_types=1);

namespace Lattice\Core\Support\Discovery;

use Spatie\StructureDiscoverer\Discover;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

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
        $classes = new Discover(directories: [$path])->classes()->get();

        return $classes;
    }

    /**
     * Every discovered structure, including enums (`->classes()` drops them).
     *
     * @param  list<string>  $ignoreDirectories
     * @return list<class-string>
     */
    public static function all(string $path, array $ignoreDirectories = []): array
    {
        if (! is_dir($path)) {
            return [];
        }

        /** @var list<class-string> $classes */
        $classes = new Discover(
            directories: [$path],
            ignoredFiles: self::phpFilesIn($ignoreDirectories),
        )->get();

        return $classes;
    }

    /**
     * @param  list<string>  $directories
     * @return list<string>
     */
    private static function phpFilesIn(array $directories): array
    {
        $directories = array_filter($directories, is_dir(...));

        if ($directories === []) {
            return [];
        }

        $files = (new Finder)->files()->name('*.php')->in($directories);

        return array_values(array_map(
            fn (SplFileInfo $file): string => $file->getPathname(),
            iterator_to_array($files),
        ));
    }
}
