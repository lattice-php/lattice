<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Tables\Columns\ColumnProps;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnknown;
use Spatie\TypeScriptTransformer\Visitor\Visitor;
use Spatie\TypeScriptTransformer\Visitor\VisitorOperation;

/**
 * Rewrites a property typed as the `ColumnProps` marker interface to
 * `Record<string, unknown>`. The marker has no generated type; precise per-type
 * props are resolved on the client via `ColumnPropsOf`.
 */
final class ColumnPropsToRecordClassPropertyProcessor implements ClassPropertyProcessor
{
    private readonly Visitor $visitor;

    public function __construct()
    {
        $this->visitor = Visitor::create()->before(function (TypeScriptReference $reference): VisitorOperation {
            $target = $reference->reference;

            if ($target instanceof ClassStringReference && is_a($target->classString, ColumnProps::class, true)) {
                return VisitorOperation::replace(new TypeScriptGeneric(
                    new TypeScriptIdentifier('Record'),
                    [new TypeScriptString, new TypeScriptUnknown],
                ));
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
