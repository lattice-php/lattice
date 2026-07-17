<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\AsComponent;
use ReflectionClass;
use Spatie\Attributes\Attributes;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnion;

/**
 * The augmentable envelope a Component/Column/Filter-typed property generates
 * as. A concrete wire class narrows to `Envelope<"type">` — unioned with every
 * known concrete descendant, so e.g. an `Action`-typed prop admits the
 * `action.bulk` a BulkAction serializes. An abstract marker (Component, Column,
 * Filter) stays the loose envelope: consumer-defined types flow through it via
 * module augmentation, so it must not close over the built-ins.
 */
final readonly class NodeTypeReference
{
    /**
     * @param  array<class-string, string>  $known  Concrete wire classes of this marker's category => wire type.
     * @param  string  $envelope  The client envelope identifier: Node, ColumnNode, or FilterNode.
     */
    public function __construct(
        private array $known = [],
        private string $envelope = 'Node',
    ) {}

    /**
     * @param  class-string  $class
     */
    public function __invoke(string $class): TypeScriptNode
    {
        $self = $this->known[$class] ?? $this->attributedType($class);

        if ($self === null) {
            return new TypeScriptIdentifier($this->envelope);
        }

        $types = [$self];

        foreach ($this->known as $candidate => $type) {
            if ($candidate !== $class && is_a($candidate, $class, true)) {
                $types[] = $type;
            }
        }

        $types = array_values(array_unique($types));
        sort($types);

        $nodes = array_map(
            fn (string $type): TypeScriptGeneric => new TypeScriptGeneric(
                new TypeScriptIdentifier($this->envelope),
                [new TypeScriptLiteral($type)],
            ),
            $types,
        );

        return count($nodes) === 1 ? $nodes[0] : new TypeScriptUnion($nodes);
    }

    /**
     * Fallback for concrete component classes outside the known map (e.g. a
     * built-in referenced from a consumer app's augment run). Columns/filters
     * have no equivalent: unknown ones stay the loose envelope.
     *
     * @param  class-string  $class
     */
    private function attributedType(string $class): ?string
    {
        if ($this->envelope !== 'Node') {
            return null;
        }

        if (! new ReflectionClass($class)->isInstantiable() || ! Attributes::has($class, AsComponent::class)) {
            return null;
        }

        return AsComponent::wireTypeForClass($class);
    }
}
