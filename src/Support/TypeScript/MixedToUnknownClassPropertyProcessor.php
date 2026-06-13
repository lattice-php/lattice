<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAny;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnknown;
use Spatie\TypeScriptTransformer\Visitor\Visitor;
use Spatie\TypeScriptTransformer\Visitor\VisitorOperation;

/**
 * Rewrites every `any` (PHP `mixed`) in a property's type to `unknown`, including
 * `any` nested inside arrays, records and unions. PHP `mixed` carries no more
 * guarantee than `unknown`, so this keeps the generated types honest: reads have
 * to narrow rather than silently passing an unchecked value downstream.
 */
final class MixedToUnknownClassPropertyProcessor implements ClassPropertyProcessor
{
    private readonly Visitor $visitor;

    public function __construct()
    {
        $this->visitor = Visitor::create()->before(
            fn (TypeScriptAny $any): VisitorOperation => VisitorOperation::replace(new TypeScriptUnknown),
            [TypeScriptAny::class],
        );
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
