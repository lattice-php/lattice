<?php
declare(strict_types=1);

use Lattice\Board\Components\Board;
use Workbench\App\Boards\TaskBoard;
use Workbench\App\Models\Task;

use function Pest\Laravel\getJson;

/**
 * @param  array<string, array<string, mixed>>  $tf
 * @param  array<string, mixed>  $extra
 */
function tfFilterQuery(string $endpoint, array $tf = [], array $extra = []): string
{
    return $endpoint.'?'.http_build_query([...$extra, 'tf' => $tf]);
}

it('filters cards and totals by a dedicated select filter', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson(
        tfFilterQuery($board['props']['endpoint'], ['assignee' => ['value' => 'Anna']]),
        ['X-Lattice-Ref' => $board['props']['ref']],
    );

    $response->assertOk();
    $columns = array_column($response->json('columns'), null, 'key');

    expect(array_column($columns['todo']['cards'], 'title'))->toBe(['Write spec'])
        ->and($columns['todo']['total'])->toBe(1)
        ->and(array_column($columns['doing']['cards'], 'title'))->toBe(['Build feature'])
        ->and($columns['doing']['total'])->toBe(1)
        ->and($columns['done']['cards'])->toBe([])
        ->and($columns['done']['total'])->toBe(0);
});

it('carries the active filter as a response indicator', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson(
        tfFilterQuery($board['props']['endpoint'], ['assignee' => ['value' => 'Anna']]),
        ['X-Lattice-Ref' => $board['props']['ref']],
    );

    $response->assertOk()
        ->assertJsonPath('indicators.0.filter', 'assignee')
        ->assertJsonPath('indicators.0.value', 'Anna');
});

it('rejects a filter key that is not declared', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    getJson(
        tfFilterQuery($board['props']['endpoint'], ['bogus' => ['value' => 'x']]),
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->assertStatus(422);
});

it('serializes the declared filters and searchable flag on the board wire', function (): void {
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    expect($board['props']['searchable'])->toBeTrue()
        ->and($board['props']['filters'])->toHaveCount(1)
        ->and($board['props']['filters'][0]['key'])->toBe('assignee')
        ->and($board['props']['filters'][0]['type'])->toBe('filter.select');
});

it('deduplicates the eagerly-resolved filter options, even though multiple tasks share an assignee', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $options = array_column($board['props']['filters'][0]['props']['options'], 'label');

    expect($options)->toEqualCanonicalizing(['Anna', 'Ben']);
});

it('resolves searchable select filter options through the board sub-request seam', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $response = getJson(
        $board['props']['endpoint'].'?'.http_build_query(['_sub' => 'search', '_target' => 'filter:assignee.value', '_q' => 'an']),
        ['X-Lattice-Ref' => $board['props']['ref']],
    );

    $response->assertOk();
    $options = array_column($response->json('options'), 'label');

    expect($options)->toBe(['Anna'])->not->toContain('Ben');
});

it('404s a filter-option search for an unknown filter key', function (): void {
    seedTaskBoard();
    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    getJson(
        $board['props']['endpoint'].'?'.http_build_query(['_sub' => 'search', '_target' => 'filter:bogus.value', '_q' => 'a']),
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->assertNotFound();
});

it('combines search and filters, preserving both across load-more paging', function (): void {
    foreach (range(0, 4) as $position) {
        Task::factory()->status('todo')->position($position)->create([
            'title' => "Anna task {$position}",
            'assignee' => 'Anna',
        ]);
    }
    Task::factory()->status('todo')->position(5)->create(['title' => 'Ben task', 'assignee' => 'Ben']);

    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));

    $first = getJson(
        tfFilterQuery($board['props']['endpoint'], ['assignee' => ['value' => 'Anna']], ['q' => 'task', 'column' => 'todo', 'offset' => 0, 'limit' => 3]),
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns.0');

    expect($first['cards'])->toHaveCount(3)
        ->and($first['total'])->toBe(5)
        ->and($first['hasMore'])->toBeTrue();

    $second = getJson(
        tfFilterQuery($board['props']['endpoint'], ['assignee' => ['value' => 'Anna']], ['q' => 'task', 'column' => 'todo', 'offset' => 3, 'limit' => 3]),
        ['X-Lattice-Ref' => $board['props']['ref']],
    )->json('columns.0');

    $assignees = array_unique(array_column([...$first['cards'], ...$second['cards']], 'assignee'));

    expect($second['cards'])->toHaveCount(2)
        ->and($second['hasMore'])->toBeFalse()
        ->and($assignees)->toBe(['Anna']);
});
