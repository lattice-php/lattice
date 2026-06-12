<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use ReflectionClass;
use Roave\BetterReflection\Reflection\ReflectionClass as RoaveReflectionClass;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeResolvers\Data\ParsedClass;

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
     * Resolve a trait property's docblock against the trait that declares it rather
     * than the using class. PHP reports a trait property's declaring class as the
     * *using* class, so a docblock like `@var list<Option>` would otherwise resolve
     * `Option` against the using class's imports — which a class such as Choice does
     * not have, yielding `unknown[]`. Native property types are unaffected; reflection
     * resolves those without a docblock.
     *
     * @return array{0: mixed, 1: PhpClassNode}
     */
    protected function resolvePropertyAnnotation(
        PhpPropertyNode $phpPropertyNode,
        PhpClassNode $phpClassNode,
        ?ParsedClass $parsedClass,
    ): array {
        [$annotation, $context] = parent::resolvePropertyAnnotation($phpPropertyNode, $phpClassNode, $parsedClass);

        $trait = $this->traitDeclaring($phpClassNode->reflection, $phpPropertyNode->getName());

        return $trait === null ? [$annotation, $context] : [$annotation, PhpClassNode::fromReflection($trait)];
    }

    /**
     * The trait that declares $name with a docblock — searched recursively, since
     * traits can use traits — or null when the property is declared on the class itself.
     *
     * @param  ReflectionClass<object>|RoaveReflectionClass  $class
     * @return ReflectionClass<object>|RoaveReflectionClass|null
     */
    private function traitDeclaring(
        ReflectionClass|RoaveReflectionClass $class,
        string $name,
    ): ReflectionClass|RoaveReflectionClass|null {
        foreach ($class->getTraits() as $trait) {
            if ($nested = $this->traitDeclaring($trait, $name)) {
                return $nested;
            }

            if ($trait->hasProperty($name) && $trait->getProperty($name)->getDocComment() !== false) {
                return $trait;
            }
        }

        return null;
    }

    /**
     * @return array<ClassPropertyProcessor>
     */
    protected function classPropertyProcessors(): array
    {
        return [
            ...parent::classPropertyProcessors(),
            new MixedToUnknownClassPropertyProcessor,
        ];
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
