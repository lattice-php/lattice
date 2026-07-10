<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components\Concerns;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Contracts\Renderable;
use LogicException;
use ReflectionMethod;
use Spatie\Attributes\Attributes;
use Spatie\Attributes\AttributeTarget;

/**
 * The node-envelope serialization pipeline shared by every wire-node family
 * (components, table columns, dedicated filters): `{type, key, props}` built by
 * a priority-ordered chain of #[SerializationHook] methods. Families extend the
 * envelope through hooks and compute props through decorateProps() — never by
 * overriding jsonSerialize() or mutating state during serialization.
 */
trait SerializesWireNode
{
    use SerializesToWire;

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        if ($this instanceof Renderable && ! $this->shouldRender()) {
            throw new LogicException(sprintf(
                '%s must not serialize: shouldRender() is false. Filter it at its collection seam before it reaches the wire.',
                static::class,
            ));
        }

        return array_reduce(
            $this->serializationHooks(),
            fn (array $data, string $hook): array => $this->{$hook}($data),
            [],
        );
    }

    protected function type(): string
    {
        return AsComponent::typeForClass(static::class);
    }

    protected function wireKey(): ?string
    {
        return $this->key;
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
            'key' => $this->wireKey(),
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
        /** @var array<class-string, list<string>> $cache */
        static $cache = [];

        return $cache[static::class] ??= collect(Attributes::find($this, SerializationHook::class))
            ->filter(fn (AttributeTarget $target): bool => $target->attribute instanceof SerializationHook && $target->target instanceof ReflectionMethod)
            ->filter(fn (AttributeTarget $target): bool => ! $target->target->isPrivate())
            ->sortBy(fn (AttributeTarget $target): array => [$target->attribute->priority, $target->name])
            ->map(fn (AttributeTarget $target): string => $target->name)
            ->values()
            ->all();
    }
}
