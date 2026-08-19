<?php
declare(strict_types=1);

namespace Lattice\Tree\Support;

/**
 * Plans a tree moveAction payload ({nodeId, parentId, position}) against the
 * current placements of one scope. The plan holds only the placements that
 * must change, with contiguous zero-based positions in both the source and
 * the destination sibling group, and is null when a structural guard fails:
 * unknown node, unknown destination parent, self-parent, or a destination
 * inside the moved node's own subtree. The consuming application persists
 * the plan inside its own transaction and applies its own domain rules —
 * the planner never writes anything.
 */
final class AdjacencyListMovePlanner
{
    private function __construct() {}

    /**
     * @param  iterable<NodePlacement>  $placements
     * @return list<NodePlacement>|null
     */
    public static function plan(
        iterable $placements,
        int|string $nodeId,
        int|string|null $parentId,
        int $position,
    ): ?array {
        $nodes = [];

        foreach ($placements as $placement) {
            $nodes[self::key($placement->id)] = $placement;
        }

        $movedKey = self::key($nodeId);
        $moved = $nodes[$movedKey] ?? null;

        if (! $moved instanceof NodePlacement) {
            return null;
        }

        $parent = $parentId === null ? null : ($nodes[self::key($parentId)] ?? null);

        if ($parentId !== null && ! $parent instanceof NodePlacement) {
            return null;
        }

        if ($parent instanceof NodePlacement && self::inSubtree($nodes, $parent, $movedKey)) {
            return null;
        }

        $destinationParentId = $parent?->id;
        $sourceSiblings = self::orderedSiblings($nodes, $moved->parentId, $movedKey);

        if (self::sameParent($moved->parentId, $destinationParentId)) {
            $destinationSiblings = $sourceSiblings;
            $sourceSiblings = [];
        } else {
            $destinationSiblings = self::orderedSiblings($nodes, $destinationParentId, $movedKey);
        }

        array_splice(
            $destinationSiblings,
            min(max($position, 0), count($destinationSiblings)),
            0,
            [$moved],
        );

        return [
            ...self::resequenced($sourceSiblings, $moved->parentId),
            ...self::resequenced($destinationSiblings, $destinationParentId),
        ];
    }

    /**
     * String identity so a JSON wire id ("5") matches an integer primary
     * key (5) while UUID and ULID ids compare untouched.
     */
    private static function key(int|string $id): string
    {
        return (string) $id;
    }

    private static function sameParent(int|string|null $a, int|string|null $b): bool
    {
        if ($a === null || $b === null) {
            return $a === $b;
        }

        return self::key($a) === self::key($b);
    }

    /**
     * @param  array<string, NodePlacement>  $nodes
     */
    private static function inSubtree(array $nodes, NodePlacement $candidate, string $rootKey): bool
    {
        $visited = [];
        $current = $candidate;

        while ($current instanceof NodePlacement) {
            $key = self::key($current->id);

            if ($key === $rootKey) {
                return true;
            }

            if (isset($visited[$key])) {
                return false;
            }

            $visited[$key] = true;
            $current = $current->parentId === null ? null : ($nodes[self::key($current->parentId)] ?? null);
        }

        return false;
    }

    /**
     * @param  array<string, NodePlacement>  $nodes
     * @return list<NodePlacement>
     */
    private static function orderedSiblings(array $nodes, int|string|null $parentId, string $movedKey): array
    {
        $siblings = array_values(array_filter(
            $nodes,
            fn (NodePlacement $node): bool => self::key($node->id) !== $movedKey
                && self::sameParent($node->parentId, $parentId),
        ));

        usort(
            $siblings,
            fn (NodePlacement $a, NodePlacement $b): int => $a->position <=> $b->position
                ?: self::key($a->id) <=> self::key($b->id),
        );

        return $siblings;
    }

    /**
     * @param  list<NodePlacement>  $siblings
     * @return list<NodePlacement>
     */
    private static function resequenced(array $siblings, int|string|null $parentId): array
    {
        $changed = [];

        foreach ($siblings as $position => $sibling) {
            if ($sibling->position !== $position || ! self::sameParent($sibling->parentId, $parentId)) {
                $changed[] = new NodePlacement($sibling->id, $parentId, $position);
            }
        }

        return $changed;
    }
}
