<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use ReflectionNamedType;
use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;

/**
 * Emits TypeScript prop types for an explicit allow-list of form components.
 * Properties whose value wireProps() can skip (null or empty array) render as
 * optional, matching the sparse wire shape.
 */
final class LatticeComponentTransformer extends ClassTransformer
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

        usort(
            $properties,
            fn (PhpPropertyNode $a, PhpPropertyNode $b): int => $a->getName() <=> $b->getName(),
        );

        return $properties;
    }

    protected function isPropertyOptional(
        PhpPropertyNode $phpPropertyNode,
        PhpClassNode $phpClassNode,
        TypeScriptNode $type,
        TransformationContext $context,
    ): bool {
        if (parent::isPropertyOptional($phpPropertyNode, $phpClassNode, $type, $context)) {
            return true;
        }

        $reflectionType = $phpPropertyNode->reflection->getType();

        if ($reflectionType === null) {
            return false;
        }

        if ($reflectionType->allowsNull()) {
            return true;
        }

        return $reflectionType instanceof ReflectionNamedType
            && $reflectionType->getName() === 'array';
    }
}
