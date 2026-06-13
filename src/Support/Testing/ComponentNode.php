<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

final class ComponentNode
{
    private const NESTED_COMPONENT_PROPS = ['form', 'headerActions', 'bulkActions', 'actions'];

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        private readonly array $data,
        private readonly string $path = 'root',
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $nodes
     */
    public static function root(array $nodes, string $path = 'page'): self
    {
        return new self(['type' => null, 'id' => null, 'props' => [], 'schema' => array_values($nodes)], $path);
    }

    public function type(): ?string
    {
        $type = $this->data['type'] ?? null;

        return is_string($type) ? $type : null;
    }

    public function id(): ?string
    {
        $id = $this->data['id'] ?? null;

        return is_string($id) ? $id : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function props(): array
    {
        $props = $this->data['props'] ?? [];

        return is_array($props) ? $props : [];
    }

    public function prop(string $key): mixed
    {
        return $this->props()[$key] ?? null;
    }

    public function path(): string
    {
        return $this->path;
    }

    /**
     * @return array<int, self>
     */
    public function descendants(): array
    {
        $all = [];

        foreach ($this->componentChildren() as $child) {
            $all[] = $child;

            foreach ($child->descendants() as $deep) {
                $all[] = $deep;
            }
        }

        return $all;
    }

    /**
     * @param  callable(self): bool  $matcher
     */
    public function find(callable $matcher): ?self
    {
        foreach ($this->descendants() as $node) {
            if ($matcher($node)) {
                return $node;
            }
        }

        return null;
    }

    /**
     * @param  callable(self): bool  $matcher
     * @return array<int, self>
     */
    public function findAll(callable $matcher): array
    {
        return array_values(array_filter($this->descendants(), $matcher));
    }

    /**
     * @param  callable(self): bool  $matcher
     * @return array<int, self>
     */
    public function findAllIncludingSelf(callable $matcher): array
    {
        $matches = $this->findAll($matcher);

        if ($matcher($this)) {
            array_unshift($matches, $this);
        }

        return $matches;
    }

    public function firstOfType(string $type, ?string $id = null): ?self
    {
        return $this->find($this->typeMatcher($type, $id));
    }

    public function firstOfTypeIncludingSelf(string $type, ?string $id = null): ?self
    {
        $matcher = $this->typeMatcher($type, $id);

        return $matcher($this) ? $this : $this->find($matcher);
    }

    public function field(string $name): ?self
    {
        return $this->find(static fn (self $node): bool => $node->prop('name') === $name);
    }

    /**
     * @return array<int, string>
     */
    public function availableSelectors(): array
    {
        $selectors = [];

        foreach ($this->descendants() as $node) {
            $type = $node->type();

            if ($type === null) {
                continue;
            }

            $selectors[] = $node->id() !== null ? $type.':'.$node->id() : $type;
        }

        return array_values(array_unique($selectors));
    }

    /**
     * @return array<int, string>
     */
    public function availableFieldNames(): array
    {
        $names = [];

        foreach ($this->descendants() as $node) {
            $name = $node->prop('name');

            if (is_string($name)) {
                $names[] = $name;
            }
        }

        return array_values(array_unique($names));
    }

    /**
     * @return callable(self): bool
     */
    private function typeMatcher(string $type, ?string $id): callable
    {
        return static fn (self $node): bool => $node->type() === $type
            && ($id === null || $node->id() === $id);
    }

    /**
     * @return array<int, self>
     */
    private function componentChildren(): array
    {
        $children = $this->schemaChildren();

        foreach (self::NESTED_COMPONENT_PROPS as $key) {
            foreach ($this->nodesFrom($this->props()[$key] ?? null) as $node) {
                $children[] = $node;
            }
        }

        return $children;
    }

    /**
     * @return array<int, self>
     */
    private function schemaChildren(): array
    {
        $schema = $this->data['schema'] ?? [];

        if (! is_array($schema)) {
            return [];
        }

        $children = [];

        foreach (array_values($schema) as $child) {
            if (is_array($child) && isset($child['type'])) {
                $children[] = new self($child, $this->childPath($child));
            }
        }

        return $children;
    }

    /**
     * @return array<int, self>
     */
    private function nodesFrom(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        if (isset($value['type']) && array_key_exists('props', $value)) {
            return [new self($value, $this->childPath($value))];
        }

        $nodes = [];

        foreach ($value as $item) {
            if (is_array($item) && isset($item['type']) && array_key_exists('props', $item)) {
                $nodes[] = new self($item, $this->childPath($item));
            }
        }

        return $nodes;
    }

    /**
     * @param  array<string, mixed>  $child
     */
    private function childPath(array $child): string
    {
        $label = is_string($child['id'] ?? null) ? $child['id'] : (string) ($child['type'] ?? '?');

        return $this->path.' › '.$label;
    }
}
