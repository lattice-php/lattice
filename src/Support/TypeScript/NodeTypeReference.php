<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use ReflectionClass;
use Spatie\Attributes\Attributes;
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
        if (! new ReflectionClass($class)->isInstantiable() || ! Attributes::has($class, AsComponent::class)) {
            return new TypeScriptIdentifier('Node');
        }

        return new TypeScriptGeneric(
            new TypeScriptIdentifier('Node'),
            [new TypeScriptLiteral(AsComponent::wireTypeForClass($class))],
        );
    }
}
