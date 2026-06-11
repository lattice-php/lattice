<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Core\Enums\HttpMethod;
use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\References\PhpClassReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\Transformed\Untransformable;
use Spatie\TypeScriptTransformer\Transformers\Transformer;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;

/**
 * Aliases the PHP HttpMethod enum onto Inertia's own `Method` type, so the wire
 * `method` props share a single source of truth with @inertiajs/core instead of
 * generating a parallel string union the frontend then has to bridge. Emitted as
 * an inline `import(...)` type so the generated module stays self-contained and
 * the reference is type-only by construction.
 */
final class LatticeHttpMethodTransformer implements Transformer
{
    public function transform(PhpClassNode $phpClassNode, TransformationContext $context): Transformed|Untransformable
    {
        if ($phpClassNode->getName() !== HttpMethod::class) {
            return Untransformable::create();
        }

        return new Transformed(
            new TypeScriptAlias(
                new TypeScriptIdentifier($context->name),
                new TypeScriptRaw('import("@inertiajs/core").Method'),
            ),
            new PhpClassReference($phpClassNode),
            $context->nameSpaceSegments,
            true,
        );
    }
}
