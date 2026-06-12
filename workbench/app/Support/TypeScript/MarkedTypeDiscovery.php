<?php

declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Attributes\TypeScript;
use ReflectionClass;
use Spatie\StructureDiscoverer\Discover;

/**
 * Discovers the classes marked with #[TypeScript] under a path and splits them
 * into backed enums and value objects — the allow-lists that drive the enum and
 * value-object transformers for the built-in types. Keeping this in the
 * workbench keeps the maintainer-only build code out of the shipped package.
 */
final class MarkedTypeDiscovery
{
    /**
     * Each list is sorted by class-string so the generated output stays
     * deterministic regardless of filesystem discovery order.
     *
     * @return array{enums: list<class-string>, valueObjects: list<class-string>}
     */
    public function discover(string $path): array
    {
        if (! is_dir($path)) {
            return ['enums' => [], 'valueObjects' => []];
        }

        // No type filter: ->classes() would exclude enums. The unfiltered get()
        // returns both classes and enums as class-strings; the #[TypeScript]
        // check below is the real allow-list. Construct Discover directly
        // instead of Discover::in() — see ComponentDiscovery for why the cached
        // variant poisons the typescript-transformer's own discovery.
        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->get();

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
