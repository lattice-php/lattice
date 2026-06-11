<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\Component as ComponentAttribute;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Tables\Columns\Column;
use ReflectionClass;
use Spatie\StructureDiscoverer\Discover;

final class ComponentDiscovery
{
    /**
     * @return list<DiscoveredComponent>
     */
    public function discover(string $path): array
    {
        if (! is_dir($path)) {
            return [];
        }

        $discovered = [];

        // Construct Discover directly instead of Discover::in(): the container binding
        // injects a cache driver, and the cache entry is keyed only by directory. The
        // Spatie typescript-transformer discovers the same directory in the same process,
        // so a cached call here poisons its results during `lattice:typescript`.
        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->classes()->get();

        foreach ($classes as $class) {
            $reflection = new ReflectionClass($class);

            if ($reflection->isAbstract()) {
                continue;
            }

            $attributes = $reflection->getAttributes(ComponentAttribute::class);

            if ($attributes === []) {
                continue;
            }

            $discovered[] = new DiscoveredComponent(
                class: $class,
                type: $attributes[0]->newInstance()->type,
                container: is_subclass_of($class, ContainerComponent::class),
                interactive: in_array(IsInteractive::class, class_uses_recursive($class), true),
                category: $this->categoryFor($class),
            );
        }

        return $discovered;
    }

    /**
     * @param  class-string  $class
     * @return 'component'|'field'|'column'
     */
    private function categoryFor(string $class): string
    {
        return match (true) {
            is_subclass_of($class, Field::class) => 'field',
            is_subclass_of($class, Column::class) => 'column',
            default => 'component',
        };
    }
}
