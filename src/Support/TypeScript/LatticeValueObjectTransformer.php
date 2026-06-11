<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;

/**
 * Emits TypeScript object types only for an explicit allow-list of value
 * objects, so unrelated classes under src/ are never generated.
 */
final class LatticeValueObjectTransformer extends ClassTransformer
{
    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(private readonly array $allowed)
    {
        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return in_array($phpClassNode->getName(), $this->allowed, true);
    }
}
