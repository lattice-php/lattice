<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsWireNode;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Contracts\ContainerComponent;
use Lattice\Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Lattice\LatticeRegistry;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionClass;
use Spatie\Attributes\Attributes;

/**
 * The single wire-surface discovery: one walk over a path, classifying every
 * #[TypeScript]-instanceof-marked class into the manifest the generation
 * profiles consume. Attribute-sourced families come from registered providers,
 * so a new family needs no branch here.
 */
final readonly class WireTypeDiscovery
{
    public function __construct(private LatticeRegistry $lattice) {}

    /**
     * @param  list<string>  $ignoreDirectories  paths skipped entirely (e.g. test scaffolding
     *                                           that can never be a wire type) so they're
     *                                           never autoloaded during the walk
     */
    public function discover(string $path, array $ignoreDirectories = []): WireTypeManifest
    {
        if (! is_dir($path)) {
            return new WireTypeManifest([], [], [], []);
        }

        $enums = [];
        $valueObjects = [];
        $components = [];
        $families = [];

        foreach (ClassWalker::all($path, $ignoreDirectories) as $class) {
            try {
                $abstract = new ReflectionClass($class)->isAbstract();
            } catch (\Throwable) {
                // A discovered class can fail to autoload when it depends on an
                // optional (e.g. require-dev) package that isn't installed in the
                // consuming app. It can't be a wire type either way, so skip it.
                continue;
            }

            if ($this->collectFamilyMember($class, $abstract, $families)) {
                continue;
            }

            $component = Attributes::get($class, AsWireNode::class);

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
        foreach ($this->lattice->wireFamilies()->where('marker', false) as $family) {
            $attribute = Attributes::get($class, $family->attribute);

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
    private function component(string $class, AsWireNode $attribute): DiscoveredComponent
    {
        return new DiscoveredComponent(
            class: $class,
            type: $attribute->type,
            container: is_a($class, ContainerComponent::class, true),
            interactive: is_a($class, InteractiveComponent::class, true),
            category: $this->lattice->wireCategoryFor($attribute),
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
