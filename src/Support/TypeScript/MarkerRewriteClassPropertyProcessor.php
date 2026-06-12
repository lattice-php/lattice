<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Closure;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\Visitor\Visitor;
use Spatie\TypeScriptTransformer\Visitor\VisitorOperation;

/**
 * Rewrites any property whose type references the given marker class or interface
 * to a fixed TypeScript node — e.g. the abstract Component base to the Node union,
 * or the ColumnProps marker to a loose record. Such markers have no generated type
 * of their own. The replacement is built per match so nodes are never shared.
 */
final class MarkerRewriteClassPropertyProcessor implements ClassPropertyProcessor
{
    private readonly Visitor $visitor;

    /**
     * @param  class-string  $marker
     * @param  Closure(): TypeScriptNode  $replacement
     */
    public function __construct(string $marker, Closure $replacement)
    {
        $this->visitor = Visitor::create()->before(function (TypeScriptReference $reference) use ($marker, $replacement): VisitorOperation {
            $target = $reference->reference;

            if ($target instanceof ClassStringReference && is_a($target->classString, $marker, true)) {
                return VisitorOperation::replace($replacement());
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
