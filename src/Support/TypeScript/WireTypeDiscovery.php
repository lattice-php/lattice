<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Components\IsInteractive;
use ReflectionAttribute;
use ReflectionClass;

/**
 * The single wire-surface discovery: one walk over a path, classifying every
 * #[TypeScript]-instanceof-marked class into the manifest the generation
 * profiles consume.
 */
final class WireTypeDiscovery
{
    public function discover(string $path): WireTypeManifest
    {
        if (! is_dir($path)) {
            return new WireTypeManifest([], [], [], []);
        }

        $enums = [];
        $valueObjects = [];
        $components = [];
        $effects = [];

        foreach (ClassWalker::all($path) as $class) {
            $reflection = new ReflectionClass($class);

            $effect = $reflection->getAttributes(AsEffect::class)[0] ?? null;
            $component = $reflection->getAttributes(AsComponent::class, ReflectionAttribute::IS_INSTANCEOF)[0] ?? null;

            if ($effect !== null) {
                if (! $reflection->isAbstract()) {
                    $effects[$class] = $effect->newInstance()->wireType();
                }
            } elseif ($component !== null) {
                if (! $reflection->isAbstract()) {
                    $components[] = $this->component($reflection, $component->newInstance());
                }
            } elseif ($reflection->getAttributes(TypeScript::class, ReflectionAttribute::IS_INSTANCEOF) !== []) {
                if (enum_exists($class)) {
                    $enums[] = $class;
                } else {
                    $valueObjects[] = $class;
                }
            }
        }

        sort($enums);
        sort($valueObjects);
        ksort($effects);

        return new WireTypeManifest($enums, $valueObjects, $components, $effects);
    }

    /**
     * @param  ReflectionClass<object>  $reflection
     */
    private function component(ReflectionClass $reflection, AsComponent $attribute): DiscoveredComponent
    {
        $class = $reflection->getName();

        return new DiscoveredComponent(
            class: $class,
            type: $attribute->type,
            container: is_subclass_of($class, ContainerComponent::class)
                || in_array(HasChildSchema::class, class_uses_recursive($class), true),
            interactive: in_array(IsInteractive::class, class_uses_recursive($class), true),
            category: match (true) {
                $attribute instanceof AsColumn => 'column',
                $attribute instanceof AsFilter => 'filter',
                default => 'component',
            },
            domain: $this->domainFor($class),
        );
    }

    /**
     * The namespace segment before `\Components\`, grouping the component into its
     * domain's `…NodeType` union.
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
