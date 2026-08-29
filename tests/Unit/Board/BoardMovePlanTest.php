<?php
declare(strict_types=1);

use Lattice\Board\Support\BoardMovePlanner;
use Lattice\Board\Support\CardPlacement;

/**
 * @param  list<array{int|string, string, int}>  $rows
 * @return list<CardPlacement>
 */
function boardPlacements(array $rows): array
{
    return array_map(
        fn (array $row): CardPlacement => new CardPlacement($row[0], $row[1], $row[2]),
        $rows,
    );
}

/**
 * @param  list<CardPlacement>|null  $plan
 * @return list<array{int|string, string, int}>|null
 */
function boardPlanRows(?array $plan): ?array
{
    return $plan === null ? null : array_map(
        fn (CardPlacement $placement): array => [$placement->id, $placement->columnKey, $placement->position],
        $plan,
    );
}

it('reorders a card down within its column and emits only the changed rows', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 1], ['c', 'todo', 2], ['d', 'todo', 3]]),
        ['todo', 'doing', 'done'],
        'a',
        'todo',
        2,
    );

    expect(boardPlanRows($plan))->toBe([
        ['b', 'todo', 0],
        ['c', 'todo', 1],
        ['a', 'todo', 2],
    ]);
});

it('reorders a card up within its column and emits only the changed rows', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 1], ['c', 'todo', 2], ['d', 'todo', 3]]),
        ['todo', 'doing', 'done'],
        'd',
        'todo',
        1,
    );

    expect(boardPlanRows($plan))->toBe([
        ['d', 'todo', 1],
        ['b', 'todo', 2],
        ['c', 'todo', 3],
    ]);
});

it('resequences both columns when moving a card across columns', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([
            ['a', 'todo', 0], ['b', 'todo', 1], ['c', 'todo', 2],
            ['x', 'doing', 0],
        ]),
        ['todo', 'doing', 'done'],
        'b',
        'doing',
        0,
    );

    expect(boardPlanRows($plan))->toBe([
        ['c', 'todo', 1],
        ['b', 'doing', 0],
        ['x', 'doing', 1],
    ]);
});

it('moves a card into an empty column', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 1]]),
        ['todo', 'doing', 'done'],
        'a',
        'done',
        0,
    );

    expect(boardPlanRows($plan))->toBe([
        ['b', 'todo', 0],
        ['a', 'done', 0],
    ]);
});

it('clamps a negative position to the start of the column', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 1], ['c', 'todo', 2]]),
        ['todo', 'doing', 'done'],
        'c',
        'todo',
        -5,
    );

    expect(boardPlanRows($plan))->toBe([
        ['c', 'todo', 0],
        ['a', 'todo', 1],
        ['b', 'todo', 2],
    ]);
});

it('clamps a position beyond the column count to the end', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([
            ['a', 'todo', 0],
            ['x', 'doing', 0], ['y', 'doing', 1],
        ]),
        ['todo', 'doing', 'done'],
        'a',
        'doing',
        99,
    );

    expect(boardPlanRows($plan))->toBe([
        ['a', 'doing', 2],
    ]);
});

it('rejects structurally invalid moves', function (int|string $cardId, string $columnKey): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'doing', 0]]),
        ['todo', 'doing', 'done'],
        $cardId,
        $columnKey,
        0,
    );

    expect($plan)->toBeNull();
})->with([
    'unknown card' => ['ghost', 'todo'],
    'unknown destination column' => ['a', 'backlog'],
]);

it('yields an empty plan when the move changes nothing', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 1]]),
        ['todo', 'doing', 'done'],
        'b',
        'todo',
        1,
    );

    expect($plan)->toBe([]);
});

it('breaks position ties by id so duplicate positions resequence deterministically', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([['a', 'todo', 0], ['b', 'todo', 0], ['c', 'todo', 1]]),
        ['todo', 'doing', 'done'],
        'c',
        'todo',
        0,
    );

    expect(boardPlanRows($plan))->toBe([
        ['c', 'todo', 0],
        ['a', 'todo', 1],
        ['b', 'todo', 2],
    ]);
});

it('matches a string wire id against integer ids and emits the original id types', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([[1, 'todo', 0], [2, 'todo', 1], [3, 'doing', 0]]),
        ['todo', 'doing', 'done'],
        '2',
        'doing',
        0,
    );

    expect(boardPlanRows($plan))->toBe([
        [2, 'doing', 0],
        [3, 'doing', 1],
    ]);
});

it('normalizes only the affected columns when the input has position gaps', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([
            ['a', 'todo', 0], ['b', 'todo', 5],
            ['x', 'doing', 0], ['y', 'doing', 7],
        ]),
        ['todo', 'doing', 'done'],
        'b',
        'todo',
        1,
    );

    expect(boardPlanRows($plan))->toBe([
        ['b', 'todo', 1],
    ]);
});

it('leaves untouched columns and unchanged cards out of the plan', function (): void {
    $plan = BoardMovePlanner::plan(
        boardPlacements([
            ['a', 'todo', 0], ['b', 'todo', 1], ['c', 'todo', 2],
            ['x', 'doing', 0],
            ['z', 'done', 0],
        ]),
        ['todo', 'doing', 'done'],
        'c',
        'todo',
        1,
    );

    expect(boardPlanRows($plan))->toBe([
        ['c', 'todo', 1],
        ['b', 'todo', 2],
    ]);
});
