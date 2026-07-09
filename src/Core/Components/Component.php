<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use JsonSerializable;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Concerns\HasDataBindings;
use Lattice\Lattice\Core\Components\Concerns\SerializesToWire;
use Lattice\Lattice\Core\Concerns\GatesRendering;
use Lattice\Lattice\Core\Contracts\Renderable;
use Lattice\Lattice\Support\Wire;
use ReflectionMethod;
use Spatie\Attributes\Attributes;
use Spatie\Attributes\AttributeTarget;

/**
 * @phpstan-consistent-constructor
 */
abstract class Component implements JsonSerializable, Renderable
{
    use GatesRendering;
    use HasDataBindings;
    use SerializesToWire;

    /**
     * @var array<class-string, list<string>>
     */
    private static array $serializationHookCache = [];

    protected bool $hideWhenCollapsed = false;

    public function __construct(protected ?string $key = null) {}

    protected function type(): string
    {
        return AsComponent::typeForClass(static::class);
    }

    public function key(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    public function hideWhenCollapsed(bool $hide = true): static
    {
        $this->hideWhenCollapsed = $hide;

        return $this;
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
            'props' => Wire::map($this->decorateProps($this->wireProps())),
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        $props = $this->decorateDataBindings($props);

        if ($this->hideWhenCollapsed) {
            $props['hideWhenCollapsed'] = true;
        }

        return $props;
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
            ->filter(fn (AttributeTarget $target): bool => $target->attribute instanceof SerializationHook && $target->target instanceof ReflectionMethod)
            ->filter(fn (AttributeTarget $target): bool => ! $target->target->isPrivate())
            ->sortBy(fn (AttributeTarget $target): array => [$target->attribute->priority, $target->name])
            ->map(fn (AttributeTarget $target): string => $target->name)
            ->values()
            ->all();
    }
}
