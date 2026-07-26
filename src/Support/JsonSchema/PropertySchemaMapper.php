<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\JsonSchema;

use Lattice\Lattice\Attributes\AsComponent;
use LogicException;
use ReflectionClass;
use ReflectionProperty;
use Spatie\Attributes\Attributes;
use Symfony\Component\TypeInfo\Type;
use Symfony\Component\TypeInfo\Type\ArrayShapeType;
use Symfony\Component\TypeInfo\Type\BuiltinType;
use Symfony\Component\TypeInfo\Type\CollectionType;
use Symfony\Component\TypeInfo\Type\EnumType;
use Symfony\Component\TypeInfo\Type\GenericType;
use Symfony\Component\TypeInfo\Type\NullableType;
use Symfony\Component\TypeInfo\Type\ObjectType;
use Symfony\Component\TypeInfo\Type\UnionType;
use Symfony\Component\TypeInfo\TypeIdentifier;
use Symfony\Component\TypeInfo\TypeResolver\TypeResolver;

/**
 * Maps one wire prop to its JSON Schema fragment: the property's type-info
 * model (native reflection merged with `@var` docblocks) walked into standard
 * keywords, with class references resolved through the JsonSchemaContext name
 * tables. The empty array is the empty schema (PHP `mixed`); the writer
 * encodes it as `{}`.
 */
final readonly class PropertySchemaMapper
{
    private const array NODE_DEF_PREFIXES = [
        'component' => 'node',
        'column' => 'column',
        'filter' => 'filter',
    ];

    private TypeResolver $resolver;

    public function __construct(private JsonSchemaContext $context)
    {
        $this->resolver = TypeResolver::create();
    }

    /**
     * @return array<string, mixed>
     */
    public function map(ReflectionProperty $property): array
    {
        return $this->fragment($this->resolver->resolve($property));
    }

    /**
     * @return array<string, mixed>
     */
    public function fragment(Type $type): array
    {
        return match (true) {
            $type instanceof NullableType => $this->nullable($type->getWrappedType()),
            $type instanceof UnionType => $this->union($type->getTypes()),
            $type instanceof ArrayShapeType => $this->shape($type),
            $type instanceof CollectionType => $this->collection($type),
            $type instanceof EnumType => $this->defReference($type->getClassName()),
            $type instanceof ObjectType => $this->object($type->getClassName()),
            $type instanceof BuiltinType => $this->builtin($type->getTypeIdentifier()),
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function nullable(Type $inner): array
    {
        $members = $inner instanceof UnionType ? $inner->getTypes() : [$inner];

        if ($this->allScalar($members)) {
            return ['type' => [...$this->scalarNames($members), 'null']];
        }

        $fragments = [];

        foreach ($members as $member) {
            $fragment = $this->fragment($member);

            foreach (isset($fragment['anyOf']) && count($fragment) === 1 ? $fragment['anyOf'] : [$fragment] as $flattened) {
                $fragments[] = $flattened;
            }
        }

        return ['anyOf' => [...$fragments, ['type' => 'null']]];
    }

    /**
     * @param  list<Type>  $members
     * @return array<string, mixed>
     */
    private function union(array $members): array
    {
        if ($this->allScalar($members)) {
            return ['type' => $this->scalarNames($members)];
        }

        return ['anyOf' => array_map($this->fragment(...), $members)];
    }

    /**
     * @param  CollectionType<covariant BuiltinType<TypeIdentifier::ARRAY>|BuiltinType<TypeIdentifier::ITERABLE>|ObjectType<object>|GenericType<covariant ObjectType<object>|BuiltinType<TypeIdentifier::ARRAY>|BuiltinType<TypeIdentifier::ITERABLE>>>  $type
     * @return array<string, mixed>
     */
    private function collection(CollectionType $type): array
    {
        $value = $this->fragment($type->getCollectionValueType());

        if ($type->isList() || $this->intKeyed($type->getCollectionKeyType())) {
            return $value === []
                ? ['type' => 'array']
                : ['type' => 'array', 'items' => $value];
        }

        $schema = ['type' => 'object', 'additionalProperties' => $value === [] ? true : $value];

        if (($keys = $this->keysHint($type->getCollectionKeyType())) !== null) {
            $schema['x-lattice'] = ['keys' => $keys];
        }

        return $schema;
    }

    /**
     * @return array<string, mixed>
     */
    private function shape(ArrayShapeType $type): array
    {
        $properties = [];
        $required = [];

        foreach ($type->getShape() as $key => $entry) {
            $properties[(string) $key] = $this->fragment($entry['type']) ?: (object) [];

            if (! $entry['optional']) {
                $required[] = (string) $key;
            }
        }

        $schema = ['type' => 'object', 'properties' => $properties];

        if ($required !== []) {
            $schema['required'] = $required;
        }

        return $schema;
    }

    /**
     * @param  class-string  $class
     * @return array<string, mixed>
     */
    private function object(string $class): array
    {
        foreach ($this->context->markers as $marker => [$category, $envelope]) {
            if ($class === $marker) {
                return ['$ref' => '#/$defs/'.$envelope];
            }

            if (is_a($class, $marker, true)) {
                return $this->nodeUnion($class, $category, $envelope);
            }
        }

        return $this->defReference($class);
    }

    /**
     * A concrete wire class narrows to its node def — unioned with every known
     * concrete descendant, so e.g. an `Action`-typed prop admits the
     * `action.bulk` a BulkAction serializes. A concrete class outside the known
     * map falls back to its own #[AsComponent] type; without one it stays the
     * loose envelope.
     *
     * @param  class-string  $class
     * @return array<string, mixed>
     */
    private function nodeUnion(string $class, string $category, string $envelope): array
    {
        $known = $this->context->nodeDefs[$category] ?? [];
        $self = $known[$class] ?? $this->attributedType($class, $category);

        if ($self === null) {
            return ['$ref' => '#/$defs/'.$envelope];
        }

        $types = [$self];

        foreach ($known as $candidate => $type) {
            if ($candidate !== $class && is_a($candidate, $class, true)) {
                $types[] = $type;
            }
        }

        $types = array_values(array_unique($types));
        sort($types);

        $prefix = self::NODE_DEF_PREFIXES[$category];
        $references = array_map(
            static fn (string $type): array => ['$ref' => '#/$defs/'.$prefix.':'.$type],
            $types,
        );

        return count($references) === 1 ? $references[0] : ['anyOf' => $references];
    }

    /**
     * @param  class-string  $class
     */
    private function attributedType(string $class, string $category): ?string
    {
        if ($category !== 'component') {
            return null;
        }

        if (! new ReflectionClass($class)->isInstantiable() || ! Attributes::has($class, AsComponent::class)) {
            return null;
        }

        return AsComponent::wireTypeForClass($class);
    }

    /**
     * @param  class-string  $class
     * @return array<string, mixed>
     */
    private function defReference(string $class): array
    {
        $name = $this->context->defNames[$class] ?? throw new LogicException(sprintf(
            'Class [%s] appears in a wire prop type but has no schema definition.',
            $class,
        ));

        return ['$ref' => '#/$defs/'.$name];
    }

    /**
     * @return array<string, mixed>
     */
    private function builtin(TypeIdentifier $identifier): array
    {
        return match ($identifier) {
            TypeIdentifier::STRING => ['type' => 'string'],
            TypeIdentifier::INT => ['type' => 'integer'],
            TypeIdentifier::FLOAT => ['type' => 'number'],
            TypeIdentifier::BOOL, TypeIdentifier::TRUE, TypeIdentifier::FALSE => ['type' => 'boolean'],
            TypeIdentifier::NULL => ['type' => 'null'],
            TypeIdentifier::ARRAY, TypeIdentifier::ITERABLE => ['type' => 'array'],
            TypeIdentifier::OBJECT => ['type' => 'object'],
            default => [],
        };
    }

    /**
     * @param  list<Type>  $members
     */
    private function allScalar(array $members): bool
    {
        return array_all($members, fn (Type $member): bool => $member instanceof BuiltinType && $this->scalarName($member->getTypeIdentifier()) !== null);
    }

    /**
     * @param  list<Type>  $members
     * @return list<string>
     */
    private function scalarNames(array $members): array
    {
        $names = [];

        foreach ($members as $member) {
            assert($member instanceof BuiltinType);
            $names[] = $this->scalarName($member->getTypeIdentifier()) ?? throw new LogicException('Non-scalar member.');
        }

        return array_values(array_unique($names));
    }

    private function scalarName(TypeIdentifier $identifier): ?string
    {
        return match ($identifier) {
            TypeIdentifier::STRING => 'string',
            TypeIdentifier::INT => 'integer',
            TypeIdentifier::FLOAT => 'number',
            TypeIdentifier::BOOL, TypeIdentifier::TRUE, TypeIdentifier::FALSE => 'boolean',
            default => null,
        };
    }

    /**
     * A pure-int-keyed collection is a JSON array on the wire — JSON objects
     * have no integer keys.
     */
    private function intKeyed(Type $keyType): bool
    {
        return $keyType instanceof BuiltinType && $keyType->getTypeIdentifier() === TypeIdentifier::INT;
    }

    private function keysHint(Type $keyType): ?string
    {
        $names = [];

        foreach ($keyType instanceof UnionType ? $keyType->getTypes() : [$keyType] as $member) {
            if ($member instanceof BuiltinType && $member->getTypeIdentifier() === TypeIdentifier::INT) {
                $names[] = 'integer';
            } elseif ($member instanceof BuiltinType && $member->getTypeIdentifier() === TypeIdentifier::STRING) {
                $names[] = 'string';
            }
        }

        sort($names);

        return $names === [] || $names === ['string'] ? null : implode('|', $names);
    }
}
