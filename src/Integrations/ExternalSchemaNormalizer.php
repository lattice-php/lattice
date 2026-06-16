<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use InvalidArgumentException;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Integrations\Components\ExternalNode;

final class ExternalSchemaNormalizer
{
    /**
     * @param  list<array<string, mixed>>  $manifest
     * @param  array<string, mixed>  $context
     * @return list<Component>
     */
    public function normalize(array $manifest, array $context = []): array
    {
        return array_map(
            fn (array $node, int|string $index): Component => $this->node($node, (string) $index, $context),
            $manifest,
            array_keys($manifest),
        );
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, mixed>  $context
     */
    private function node(array $node, string $path, array $context): Component
    {
        $type = $node['type'] ?? null;

        if (! is_string($type) || $type === '') {
            throw new InvalidArgumentException("External schema node at [{$path}] is missing a string type.");
        }

        $props = $node['props'] ?? [];
        if (! is_array($props)) {
            throw new InvalidArgumentException("External schema node at [{$path}] has invalid props.");
        }

        $children = $node['schema'] ?? [];
        if (! is_array($children)) {
            throw new InvalidArgumentException("External schema node at [{$path}] has invalid schema.");
        }

        $normalized = array_map(
            fn (mixed $child, int|string $index): Component => is_array($child)
                ? $this->node($child, "{$path}.schema.{$index}", $context)
                : throw new InvalidArgumentException("External schema node at [{$path}.schema.{$index}] is invalid."),
            $children,
            array_keys($children),
        );

        $key = is_string($node['key'] ?? null) ? $node['key'] : null;
        $component = new ExternalNode(
            key: $key,
            nodeType: $type,
            props: $props,
            schema: $normalized,
        );

        $id = is_string($node['id'] ?? null) ? $node['id'] : $key;
        if ($id !== null) {
            $component->id($id);
        }

        if ($context !== []) {
            $component->context($context);
        }

        return $component;
    }
}
