<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;

/**
 * Sort by name so the generated output is deterministic across PHP versions:
 * ReflectionClass::getProperties() reports inherited and trait properties in a
 * different order on 8.4 vs 8.5.
 */
trait SortsPropertiesByName
{
    /**
     * @return array<PhpPropertyNode>
     */
    #[\Override]
    protected function getProperties(PhpClassNode $phpClassNode): array
    {
        $properties = parent::getProperties($phpClassNode);

        usort(
            $properties,
            fn (PhpPropertyNode $a, PhpPropertyNode $b): int => $a->getName() <=> $b->getName(),
        );

        return $properties;
    }
}
