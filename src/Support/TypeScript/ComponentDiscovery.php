<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\Column as ColumnAttribute;
use Lattice\Lattice\Attributes\Component as ComponentAttribute;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionAttribute;
use ReflectionClass;

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

        $classes = ClassWalker::classes($path);

        foreach ($classes as $class) {
            $reflection = new ReflectionClass($class);

            if ($reflection->isAbstract()) {
                continue;
            }

            $attributes = $reflection->getAttributes(ComponentAttribute::class, ReflectionAttribute::IS_INSTANCEOF);

            if ($attributes === []) {
                continue;
            }

            $attribute = $attributes[0]->newInstance();
            $isColumn = $attribute instanceof ColumnAttribute;

            $discovered[] = new DiscoveredComponent(
                class: $class,
                type: $attribute->type,
                container: is_subclass_of($class, ContainerComponent::class),
                interactive: in_array(IsInteractive::class, class_uses_recursive($class), true),
                category: $isColumn ? 'column' : (is_subclass_of($class, Field::class) ? 'field' : 'component'),
                domain: $this->domainFor($class),
                propsClass: $isColumn ? $attribute->props : null,
            );
        }

        return $discovered;
    }

    /**
     * The namespace segment before `\Components\`, grouping the component into its
     * Node union.
     *
     * @param  class-string  $class
     */
    private function domainFor(string $class): string
    {
        $parts = explode('\\', $class);
        $index = array_search('Components', $parts, true);

        return $index !== false && $index > 0 ? $parts[$index - 1] : '';
    }
}
