<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use ReflectionAttribute;
use ReflectionClass;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;

/**
 * The augmentable node a Component/Filter-typed property generates as. A concrete
 * node class (Form, Action, a filter) carries a known wire discriminator, so it
 * narrows to `Node<"type">`; an abstract base (Component/Filter) or a heterogeneous
 * child list stays the loose `Node`. Shared by the component and value-object
 * transformers so every node-typed field resolves the same way.
 */
final class NodeTypeReference
{
    /**
     * @param  class-string  $class
     */
    public static function for(string $class): TypeScriptNode
    {
        $reflection = new ReflectionClass($class);

        if (! $reflection->isInstantiable()
            || $reflection->getAttributes(AsComponent::class, ReflectionAttribute::IS_INSTANCEOF) === []) {
            return new TypeScriptIdentifier('Node');
        }

        return new TypeScriptGeneric(
            new TypeScriptIdentifier('Node'),
            [new TypeScriptLiteral(AsComponent::typeForClass($class))],
        );
    }
}
