<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;

/**
 * Emits TypeScript prop types for an explicit allow-list of components. Every
 * prop is a required key; nullable PHP types surface as `T | null`, mirroring
 * the full wire shape that wireProps() now serializes.
 */
final class ComponentTransformer extends ClassTransformer
{
    /**
     * @param  array<int, class-string>  $allowed
     * @param  array<int, class-string>  $ownPropertiesOnly  classes that emit only their own declared properties (e.g. columns, to drop the inherited `key`)
     */
    public function __construct(
        private readonly array $allowed,
        private readonly array $ownPropertiesOnly = [],
    ) {
        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return in_array($phpClassNode->getName(), $this->allowed, true);
    }

    /**
     * Sort by name so the generated output is deterministic across PHP versions:
     * ReflectionClass::getProperties() reports inherited and trait properties in a
     * different order on 8.4 vs 8.5.
     *
     * @return array<PhpPropertyNode>
     */
    protected function getProperties(PhpClassNode $phpClassNode): array
    {
        $properties = parent::getProperties($phpClassNode);

        if (in_array($phpClassNode->getName(), $this->ownPropertiesOnly, true)) {
            $properties = array_filter(
                $properties,
                fn (PhpPropertyNode $p): bool => $p->getDeclaringClass()->getName() === $phpClassNode->getName(),
            );
        }

        usort(
            $properties,
            fn (PhpPropertyNode $a, PhpPropertyNode $b): int => $a->getName() <=> $b->getName(),
        );

        return $properties;
    }
}
