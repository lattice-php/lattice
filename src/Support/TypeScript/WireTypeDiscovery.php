<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Components\IsInteractive;
use ReflectionClass;
use Spatie\Attributes\Attributes;

/**
 * The single wire-surface discovery: one walk over a path, classifying every
 * #[TypeScript]-instanceof-marked class into the manifest the generation
 * profiles consume. Attribute-sourced families come from the WireFamily table,
 * so a new family needs no branch here.
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
        $families = [];

        foreach (ClassWalker::all($path) as $class) {
            $abstract = new ReflectionClass($class)->isAbstract();

            if ($this->collectFamilyMember($class, $abstract, $families)) {
                continue;
            }

            $component = Attributes::get($class, AsComponent::class);

            if ($component !== null) {
                if (! $abstract) {
                    $components[] = $this->component($class, $component);
                }
            } elseif (Attributes::has($class, TypeScript::class)) {
                if (enum_exists($class)) {
                    $enums[] = $class;
                } else {
                    $valueObjects[] = $class;
                }
            }
        }

        sort($enums);
        sort($valueObjects);

        foreach ($families as &$family) {
            ksort($family);
        }

        return new WireTypeManifest($enums, $valueObjects, $components, $families);
    }

    /**
     * @param  class-string  $class
     * @param  array<string, array<class-string, string>>  $families
     */
    private function collectFamilyMember(string $class, bool $abstract, array &$families): bool
    {
        foreach (WireFamily::registryFamilies() as $family) {
            $attribute = Attributes::get($class, $family->attribute());

            if ($attribute === null) {
                continue;
            }

            if (! $abstract) {
                $families[$family->category][$class] = $attribute->wireType();
            }

            return true;
        }

        return false;
    }

    /**
     * @param  class-string  $class
     */
    private function component(string $class, AsComponent $attribute): DiscoveredComponent
    {
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
