<?php

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use JsonSerializable;
use Lattice\Lattice\Attributes\SerializationHook;
use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;
use Spatie\Attributes\Attributes;
use Spatie\Attributes\AttributeTarget;

/**
 * @phpstan-consistent-constructor
 */
abstract class Component implements JsonSerializable
{
    /**
     * @var array<class-string, list<string>>
     */
    private static array $serializationHookCache = [];

    /**
     * @var array<class-string, list<ReflectionProperty>>
     */
    private static array $wirePropertyCache = [];

    protected bool $shouldRender = true;

    public function __construct(protected ?string $key = null) {}

    abstract protected function type(): string;

    public function key(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    protected function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    public function when(bool $condition): static
    {
        $this->shouldRender = $condition;

        return $this;
    }

    public function shouldRender(): bool
    {
        return $this->shouldRender;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return array_reduce(
            $this->serializationHooks(),
            fn (array $data, string $hook): array => $this->{$hook}($data),
            [],
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 100)]
    protected function serialiseBase(array $data): array
    {
        return [
            ...$data,
            'type' => $this->type(),
            'key' => $this->key,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 200)]
    protected function serialiseProps(array $data): array
    {
        return [
            ...$data,
            'props' => $this->wireProps(),
        ];
    }

    /**
     * Reflects the public typed properties (including inherited and trait
     * properties) into the full wire shape: every initialized prop is emitted,
     * keeping null and empty-array values so the payload mirrors the generated
     * type one-to-one. Backed enums serialize to their value.
     *
     * @return array<string, mixed>
     */
    protected function wireProps(): array
    {
        $props = [];

        foreach (self::wireProperties(static::class) as $property) {
            if (! $property->isInitialized($this)) {
                continue;
            }

            $value = $property->getValue($this);

            $props[$property->getName()] = $value instanceof BackedEnum ? $value->value : $value;
        }

        return $props;
    }

    /**
     * @param  class-string  $class
     * @return list<ReflectionProperty>
     */
    private static function wireProperties(string $class): array
    {
        return self::$wirePropertyCache[$class] ??= array_values(array_filter(
            (new ReflectionClass($class))->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $property): bool => ! $property->isStatic(),
        ));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 10000)]
    protected function filterEmptyValues(array $data): array
    {
        return array_filter(
            $data,
            fn (mixed $value, string $key): bool => $key === 'props' || ($value !== null && $value !== []),
            ARRAY_FILTER_USE_BOTH,
        );
    }

    /**
     * @return list<string>
     */
    private function serializationHooks(): array
    {
        return self::$serializationHookCache[static::class] ??= collect(Attributes::find($this, SerializationHook::class))
            ->filter(fn (AttributeTarget $target) => $target->attribute instanceof SerializationHook && $target->target instanceof ReflectionMethod)
            ->filter(fn (AttributeTarget $target) => ! $target->target->isPrivate())
            ->sortBy(fn (AttributeTarget $target): array => [$target->attribute->priority, $target->name])
            ->map(fn (AttributeTarget $target): string => $target->name)
            ->values()
            ->all();
    }
}
