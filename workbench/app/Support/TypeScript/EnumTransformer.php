<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Support\TypeScript\AllowsListedClasses;
use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Transformed\Untransformable;
use Spatie\TypeScriptTransformer\Transformers\EnumTransformer as BaseEnumTransformer;

/**
 * Emits TypeScript unions only for an explicit allow-list of backed enums,
 * so unrelated or oversized enums are never generated.
 */
final class EnumTransformer extends BaseEnumTransformer
{
    use AllowsListedClasses;

    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(array $allowed)
    {
        $this->allowed = $allowed;

        parent::__construct(useUnionEnums: true);
    }

    #[\Override]
    public function transform(PhpClassNode $phpClassNode, TransformationContext $context): Transformed|Untransformable
    {
        if (! $this->isListed($phpClassNode)) {
            return Untransformable::create();
        }

        return parent::transform($phpClassNode, $context);
    }
}
