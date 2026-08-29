<?php
declare(strict_types=1);

use Lattice\Board\Components\Board;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Tests\TestCase;
use Workbench\App\Boards\TaskBoard;
use Workbench\App\Models\Task;

use function Pest\Laravel\getJson;

it('returns every column for the initial request', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson($board['props']['endpoint'], ['X-Lattice-Ref' => $board['props']['ref']]);

    $response->assertOk();

    expect(array_column($response->json('columns'), 'key'))->toBe(['todo', 'doing', 'done']);
});

it('serves one column with a paged slice and flips hasMore across the boundary', function (): void {
    foreach (range(0, 4) as $position) {
        Task::factory()->status('todo')->position($position)->create(['title' => "Task {$position}"]);
    }

    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $first = getJson(
        $board['props']['endpoint'].'?column=todo&offset=0&limit=2',
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns');

    expect($first)->toHaveCount(1)
        ->and(array_column($first[0]['cards'], 'title'))->toBe(['Task 0', 'Task 1'])
        ->and($first[0]['hasMore'])->toBeTrue()
        ->and($first[0]['total'])->toBe(5)
        ->and($first[0]['offset'])->toBe(0);

    $last = getJson(
        $board['props']['endpoint'].'?column=todo&offset=4&limit=2',
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns')[0];

    expect(array_column($last['cards'], 'title'))->toBe(['Task 4'])
        ->and($last['hasMore'])->toBeFalse()
        ->and($last['total'])->toBe(5)
        ->and($last['offset'])->toBe(4);
});

it('keeps the column total independent of the requested offset', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $withoutOffset = getJson(
        $board['props']['endpoint'].'?column=todo',
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns.0.total');

    $withOffset = getJson(
        $board['props']['endpoint'].'?column=todo&offset=1',
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns.0.total');

    expect($withoutOffset)->toBe(2)->and($withOffset)->toBe(2);
});

it('filters cards by the search term across searchable fields', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson($board['props']['endpoint'].'?q=Anna', ['X-Lattice-Ref' => $board['props']['ref']]);

    $columns = array_column($response->json('columns'), null, 'key');

    expect(array_column($columns['todo']['cards'], 'title'))->toBe(['Write spec'])
        ->and($columns['todo']['total'])->toBe(1)
        ->and($columns['doing']['total'])->toBe(1)
        ->and($columns['done']['total'])->toBe(0);
});

it('clamps a negative offset and an out-of-range limit', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson(
        $board['props']['endpoint'].'?column=todo&offset=-5&limit=0',
        ['X-Lattice-Ref' => $board['props']['ref']],
    );

    $response->assertOk();

    $todo = $response->json('columns')[0];

    expect($todo['offset'])->toBe(0)
        ->and($todo['cards'])->toHaveCount(1)
        ->and($todo['hasMore'])->toBeTrue();
});

it('rejects an unknown column', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    getJson($board['props']['endpoint'].'?column=archived', ['X-Lattice-Ref' => $board['props']['ref']])
        ->assertStatus(422);
});

it('rejects a request whose ref does not authorize the board', function (Closure $headers): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    getJson($board['props']['endpoint'], $headers($this, $board))->assertForbidden();
})->with([
    'no ref' => [fn (): array => []],
    'forged ref' => [fn (): array => ['X-Lattice-Ref' => 'forged']],
    'expired ref' => [function (TestCase $test, array $board): array {
        $test->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

        return ['X-Lattice-Ref' => $board['props']['ref']];
    }],
    'ref sealed for a different board' => [fn (): array => [
        'X-Lattice-Ref' => app(SignsComponentReferences::class)->seal('board', 'denied', []),
    ]],
]);

it('returns 404 for a sealed but unregistered board key', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('board', 'ghost', []);

    getJson('/lattice/boards/ghost', ['X-Lattice-Ref' => $ref])->assertNotFound();
});

it('denies when the definition rejects authorization', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('board', 'denied', []);

    getJson('/lattice/boards/denied', ['X-Lattice-Ref' => $ref])->assertForbidden();
});
