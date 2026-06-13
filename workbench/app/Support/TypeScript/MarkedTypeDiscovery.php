<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionClass;

/**
 * Discovers #[TypeScript]-marked enums and value objects under a path — the
 * allow-lists for the built-in enum and value-object transformers.
 */
final class MarkedTypeDiscovery
{
    /**
     * Lists sorted by class-string to keep generated output deterministic.
     *
     * @return array{enums: list<class-string>, valueObjects: list<class-string>}
     */
    public function discover(string $path): array
    {
        if (! is_dir($path)) {
            return ['enums' => [], 'valueObjects' => []];
        }

        // Unfiltered get() so enums come through (->classes() drops them); the
        // #[TypeScript] check is the real filter.
        $classes = ClassWalker::all($path);

        $enums = [];
        $valueObjects = [];

        foreach ($classes as $class) {
            if ((new ReflectionClass($class))->getAttributes(TypeScript::class) === []) {
                continue;
            }

            if (enum_exists($class)) {
                $enums[] = $class;
            } else {
                $valueObjects[] = $class;
            }
        }

        sort($enums);
        sort($valueObjects);

        return ['enums' => $enums, 'valueObjects' => $valueObjects];
    }
}
