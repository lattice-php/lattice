<?php

declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Core\Components\Component;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\Visitor\Visitor;
use Spatie\TypeScriptTransformer\Visitor\VisitorOperation;

/**
 * Rewrites any property typed as a Lattice Component (e.g. `?Component`,
 * `Component[]`) to the generated `Node` union. Component is an abstract base
 * with no TypeScript type of its own; its wire representation is a `Node`.
 */
final class ComponentToNodeClassPropertyProcessor implements ClassPropertyProcessor
{
    private readonly Visitor $visitor;

    public function __construct()
    {
        $this->visitor = Visitor::create()->before(function (TypeScriptReference $reference): VisitorOperation {
            $target = $reference->reference;

            if ($target instanceof ClassStringReference && is_a($target->classString, Component::class, true)) {
                return VisitorOperation::replace(new TypeScriptReference(NodesProvider::nodeReference()));
            }

            return VisitorOperation::keep();
        }, [TypeScriptReference::class]);
    }

    public function execute(
        PhpPropertyNode $phpPropertyNode,
        ?TypeNode $annotation,
        TypeScriptProperty $property,
    ): TypeScriptProperty {
        $property->type = $this->visitor->execute($property->type);

        return $property;
    }
}
