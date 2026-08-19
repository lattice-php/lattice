<?php
declare(strict_types=1);

use Lattice\Tree\Support\AdjacencyListMovePlanner;
use Lattice\Tree\Support\NodePlacement;

/**
 * @param  list<array{int|string, int|string|null, int}>  $rows
 * @return list<NodePlacement>
 */
function movePlacements(array $rows): array
{
    return array_map(
        fn (array $row): NodePlacement => new NodePlacement($row[0], $row[1], $row[2]),
        $rows,
    );
}

/**
 * @param  list<NodePlacement>|null  $plan
 * @return list<array{int|string, int|string|null, int}>|null
 */
function planRows(?array $plan): ?array
{
    return $plan === null ? null : array_map(
        fn (NodePlacement $placement): array => [$placement->id, $placement->parentId, $placement->position],
        $plan,
    );
}

it('reorders within a parent and emits only the changed rows', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([['a', null, 0], ['b', null, 1], ['c', null, 2], ['d', null, 3]]),
        'd',
        null,
        1,
    );

    expect(planRows($plan))->toBe([
        ['d', null, 1],
        ['b', null, 2],
        ['c', null, 3],
    ]);
});

it('resequences both sibling groups when moving to another parent', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([
            ['p1', null, 0], ['p2', null, 1],
            ['x', 'p1', 0], ['y', 'p1', 1], ['z', 'p1', 2],
        ]),
        'y',
        'p2',
        0,
    );

    expect(planRows($plan))->toBe([
        ['z', 'p1', 1],
        ['y', 'p2', 0],
    ]);
});

it('moves a nested node to the root level', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([
            ['p1', null, 0], ['p2', null, 1],
            ['x', 'p1', 0], ['y', 'p1', 1],
        ]),
        'y',
        null,
        1,
    );

    expect(planRows($plan))->toBe([
        ['y', null, 1],
        ['p2', null, 2],
    ]);
});

it('clamps a position beyond the sibling count to the end', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([
            ['p1', null, 0], ['p2', null, 1],
            ['x', 'p2', 0], ['y', 'p2', 1],
        ]),
        'p1',
        'p2',
        99,
    );

    expect(planRows($plan))->toBe([
        ['p2', null, 0],
        ['p1', 'p2', 2],
    ]);
});

it('moves a node to position zero and shifts every sibling', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([['a', null, 0], ['b', null, 1], ['c', null, 2]]),
        'c',
        null,
        0,
    );

    expect(planRows($plan))->toBe([
        ['c', null, 0],
        ['a', null, 1],
        ['b', null, 2],
    ]);
});

it('rejects structurally invalid moves', function (int|string $nodeId, int|string|null $parentId): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([['r', null, 0], ['c1', 'r', 0], ['c2', 'c1', 0]]),
        $nodeId,
        $parentId,
        0,
    );

    expect($plan)->toBeNull();
})->with([
    'unknown node' => ['ghost', null],
    'unknown destination parent' => ['c1', 'ghost'],
    'self-parent' => ['c1', 'c1'],
    'destination inside the moved subtree' => ['r', 'c2'],
]);

it('yields an empty plan when the move changes nothing', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([['a', null, 0], ['b', null, 1]]),
        'b',
        null,
        1,
    );

    expect($plan)->toBe([]);
});

it('breaks position ties by id so duplicate positions resequence deterministically', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([['a', null, 0], ['b', null, 0], ['c', null, 1]]),
        'c',
        null,
        0,
    );

    expect(planRows($plan))->toBe([
        ['c', null, 0],
        ['a', null, 1],
        ['b', null, 2],
    ]);
});

it('matches a string wire id against integer ids and emits the original id types', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([[1, null, 0], [2, null, 1], [3, 1, 0]]),
        '3',
        '2',
        0,
    );

    expect(planRows($plan))->toBe([
        [3, 2, 0],
    ]);
});

it('plans uuid-style string ids untouched', function (): void {
    $plan = AdjacencyListMovePlanner::plan(
        movePlacements([
            ['0198f0aa-aaaa-7aaa-8aaa-aaaaaaaaaaaa', null, 0],
            ['0198f0aa-bbbb-7bbb-8bbb-bbbbbbbbbbbb', null, 1],
        ]),
        '0198f0aa-bbbb-7bbb-8bbb-bbbbbbbbbbbb',
        null,
        0,
    );

    expect(planRows($plan))->toBe([
        ['0198f0aa-bbbb-7bbb-8bbb-bbbbbbbbbbbb', null, 0],
        ['0198f0aa-aaaa-7aaa-8aaa-aaaaaaaaaaaa', null, 1],
    ]);
});
