<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Attributes\WireType;
use Lattice\Lattice\Support\TypeScript\AllowsListedClasses;
use Lattice\Lattice\Support\TypeScript\MarkerRewriteClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\MixedToUnknownClassPropertyProcessor;
use Lattice\Lattice\Support\TypeScript\NodeTypeReference;
use Lattice\Lattice\Support\TypeScript\SortsPropertiesByName;
use Spatie\Attributes\Attributes;
use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Transformed\Untransformable;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeResolvers\Data\ParsedClass;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNever;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;

/**
 * Emits TypeScript object types only for an explicit allow-list of value
 * objects, so unrelated classes under src/ are never generated.
 */
final class ValueObjectTransformer extends ClassTransformer
{
    use AllowsListedClasses;
    use SortsPropertiesByName;

    /**
     * @param  array<int, class-string>  $allowed
     * @param  array<class-string, NodeTypeReference>  $markerRefs  Marker base class => its envelope resolver.
     */
    public function __construct(
        array $allowed,
        private readonly array $markerRefs = [],
    ) {
        $this->allowed = $allowed;

        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return $this->isListed($phpClassNode);
    }

    #[\Override]
    public function transform(PhpClassNode $phpClassNode, TransformationContext $context): Transformed|Untransformable
    {
        if ($this->isListed($phpClassNode)) {
            /** @var class-string $class */
            $class = $phpClassNode->getName();
            $context->name = Attributes::get($class, WireType::class)?->typeNamePrefix().$context->name;
        }

        return parent::transform($phpClassNode, $context);
    }

    /**
     * Propless value objects emit `Record<string, never>` like propless
     * components do, keeping one spelling for "no props" in the flat module.
     */
    #[\Override]
    protected function getTypeScriptNode(
        PhpClassNode $phpClassNode,
        TransformationContext $context,
        ?ParsedClass $parsedClass = null,
    ): TypeScriptNode {
        $node = parent::getTypeScriptNode($phpClassNode, $context, $parsedClass);

        if ($node instanceof TypeScriptObject && $node->properties === []) {
            return new TypeScriptGeneric(
                new TypeScriptIdentifier('Record'),
                [new TypeScriptString, new TypeScriptNever],
            );
        }

        return $node;
    }

    /**
     * @return array<ClassPropertyProcessor>
     */
    #[\Override]
    protected function classPropertyProcessors(): array
    {
        $processors = [
            ...parent::classPropertyProcessors(),
            new MixedToUnknownClassPropertyProcessor,
        ];

        foreach ($this->markerRefs as $marker => $ref) {
            $processors[] = new MarkerRewriteClassPropertyProcessor($marker, $ref(...));
        }

        return $processors;
    }
}
