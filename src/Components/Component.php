<?php

namespace Bambamboole\Lattice\Components;

use JsonSerializable;

/**
 * @phpstan-consistent-constructor
 */
abstract class Component implements JsonSerializable
{
    /**
     * @var array<string, mixed>
     */
    protected array $props = [];

    /**
     * @var array<int, Component>
     */
    protected array $children = [];

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
     * @param  array<int, Component>  $children
     */
    public function children(array $children): static
    {
        $this->children = $children;

        return $this;
    }

    public function child(Component $child): static
    {
        $this->children[] = $child;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [
            'type' => $this->type(),
            'key' => $this->key,
            'props' => $this->props,
            'children' => array_map(
                fn (Component $child): array => $child->toArray(),
                array_values(array_filter(
                    $this->children,
                    fn (Component $child): bool => $child->shouldRender(),
                )),
            ),
        ];

        return array_filter(
            $data,
            fn (mixed $value): bool => $value !== null && $value !== [],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
