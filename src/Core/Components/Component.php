<?php

namespace Bambamboole\Lattice\Core\Components;

use Bambamboole\Lattice\Attributes\SerializationHook;
use JsonSerializable;
use ReflectionMethod;
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
     * @var array<string, mixed>
     */
    protected array $props = [];

    protected bool $shouldRender = true;

    public function __construct(protected ?string $key = null) {}

    abstract protected function type(): string;

    public function key(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     */
    public function props(array $props): static
    {
        $this->props = [
            ...$this->props,
            ...$props,
        ];

        return $this;
    }

    public function prop(string $name, mixed $value): static
    {
        $this->props[$name] = $value;

        return $this;
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
    public function toArray(): array
    {
        return array_reduce(
            $this->serializationHooks(),
            fn (array $data, string $hook): array => $this->{$hook}($data),
            [],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
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
            'props' => $this->props,
        ];
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
            fn (mixed $value): bool => $value !== null && $value !== [],
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
