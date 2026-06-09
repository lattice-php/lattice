<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Transformed\Untransformable;
use Spatie\TypeScriptTransformer\Transformers\EnumTransformer;

/**
 * Emits TypeScript unions only for an explicit allow-list of backed enums,
 * so unrelated or oversized enums (e.g. LucideIcon) are never generated.
 */
final class LatticeEnumTransformer extends EnumTransformer
{
    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(private readonly array $allowed)
    {
        parent::__construct(useUnionEnums: true);
    }

    public function transform(PhpClassNode $phpClassNode, TransformationContext $context): Transformed|Untransformable
    {
        if (! in_array($phpClassNode->getName(), $this->allowed, true)) {
            return Untransformable::create();
        }

        return parent::transform($phpClassNode, $context);
    }
}
