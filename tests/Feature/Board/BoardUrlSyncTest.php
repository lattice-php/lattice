<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Board\BoardRegistry;
use Lattice\Board\Components\Board;
use Lattice\Table\InvalidTableQuery;
use Workbench\App\Boards\TaskBoard;
use Workbench\App\Models\Task;

test('a synced board restores q from the request and filters the initial result', function (): void {
    seedTaskBoard();

    app()->instance('request', Request::create('/', 'GET', ['q' => 'Anna']));

    $board = wire(Board::use(TaskBoard::class));
    $columns = array_column(data_get($board, 'props.result.columns'), null, 'key');

    expect(data_get($board, 'props.query.q'))->toBe('Anna')
        ->and(data_get($board, 'props.syncQuery'))->toBeTrue()
        ->and(data_get($board, 'props.queryKey'))->toBeNull()
        ->and(array_column($columns['todo']['cards'], 'title'))->toBe(['Write spec'])
        ->and(array_column($columns['doing']['cards'], 'title'))->toBe(['Build feature'])
        ->and($columns['done']['cards'])->toBe([]);
});

test('a synced board restores tf from the request and filters the initial result', function (): void {
    seedTaskBoard();

    app()->instance('request', Request::create('/', 'GET', ['tf' => ['assignee' => ['value' => 'Ben']]]));

    $board = wire(Board::use(TaskBoard::class));
    $columns = array_column(data_get($board, 'props.result.columns'), null, 'key');

    expect(data_get($board, 'props.query.tf.assignee.value'))->toBe('Ben')
        ->and(array_column($columns['todo']['cards'], 'title'))->toBe(['Review PR'])
        ->and(array_column($columns['done']['cards'], 'title'))->toBe(['Ship release'])
        ->and($columns['doing']['cards'])->toBe([]);
});

test('column and offset in the page URL are ignored on the initial render', function (): void {
    foreach (range(0, 4) as $position) {
        Task::factory()->status('todo')->position($position)->create(['title' => "Task {$position}"]);
    }

    app()->instance('request', Request::create('/', 'GET', ['column' => 'todo', 'offset' => 50, 'limit' => 1]));

    $board = wire(Board::use(TaskBoard::class));
    $columns = array_column(data_get($board, 'props.result.columns'), null, 'key');

    expect($columns)->toHaveCount(3)
        ->and(array_column($columns['todo']['cards'], 'title'))
        ->toBe(['Task 0', 'Task 1', 'Task 2', 'Task 3', 'Task 4'])
        ->and($columns['todo']['offset'])->toBe(0);
});

test('a synced board drops an unknown tf key instead of rejecting the page render', function (): void {
    seedTaskBoard();

    app()->instance('request', Request::create('/', 'GET', ['tf' => ['bogus' => ['value' => 'x']]]));

    $board = wire(Board::use(TaskBoard::class));

    expect(data_get($board, 'props.query.tf'))->toBe([]);
});

test('the board endpoint still rejects an unknown tf key, unaffected by tolerant page-render parsing', function (): void {
    app(BoardRegistry::class)->response(
        'tasks',
        Request::create('/', 'GET', ['tf' => ['bogus' => ['value' => 'x']]]),
    );
})->throws(InvalidTableQuery::class);
