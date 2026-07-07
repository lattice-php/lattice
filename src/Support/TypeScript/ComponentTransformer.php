<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Core\Components\Component;
use ReflectionClass;
use Roave\BetterReflection\Reflection\ReflectionClass as RoaveReflectionClass;
use Spatie\TypeScriptTransformer\Data\TransformationContext;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\Transformers\ClassPropertyProcessors\ClassPropertyProcessor;
use Spatie\TypeScriptTransformer\Transformers\ClassTransformer;
use Spatie\TypeScriptTransformer\TypeResolvers\Data\ParsedClass;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNever;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;

/**
 * Emits TypeScript prop types for an explicit allow-list of components. Every
 * prop is a required key; nullable PHP types surface as `T | null`, mirroring
 * the full wire shape that wireProps() now serializes.
 */
final class ComponentTransformer extends ClassTransformer
{
    use AllowsListedClasses;

    /**
     * @param  array<int, class-string>  $allowed
     */
    public function __construct(array $allowed)
    {
        $this->allowed = $allowed;

        parent::__construct();
    }

    protected function shouldTransform(PhpClassNode $phpClassNode): bool
    {
        return $this->isListed($phpClassNode);
    }

    /**
     * Emit `Record<string, never>` rather than `object` for a propless component
     * (e.g. Menu, Outlet). `object` has no index signature, so it would not be
     * assignable to the renderer's loose `props` bag and the wire node could not
     * flow into the renderer; `Record<string, never>` keeps that path open.
     */
    #[\Override]
    protected function getTypeScriptNode(
        PhpClassNode $phpClassNode,
        TransformationContext $context,
        ?ParsedClass $parsedClass = null,
    ): TypeScriptNode {
        $node = parent::getTypeScriptNode($phpClassNode, $context, $parsedClass);

        if ($node instanceof TypeScriptObject && $node->properties === []) {
            return new TypeScriptGeneric(
                new TypeScriptIdentifier('Record'),
                [new TypeScriptString, new TypeScriptNever],
            );
        }

        return $node;
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
    #[\Override]
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
    #[\Override]
    protected function classPropertyProcessors(): array
    {
        return [
            ...parent::classPropertyProcessors(),
            new MarkerRewriteClassPropertyProcessor(Component::class, fn (): TypeScriptNode => new TypeScriptIdentifier('WireNode')),
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
