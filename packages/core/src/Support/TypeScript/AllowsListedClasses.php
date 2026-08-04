<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;

/**
 * Shared allow-list gate for the transformers: each one only emits a type for a
 * class it was explicitly given, so unrelated classes under a discover root are
 * never generated. Using classes assign `$allowed` in their constructor.
 */
trait AllowsListedClasses
{
    /** @var array<int, class-string> */
    protected array $allowed = [];

    protected function isListed(PhpClassNode $phpClassNode): bool
    {
        return in_array($phpClassNode->getName(), $this->allowed, true);
    }
}
