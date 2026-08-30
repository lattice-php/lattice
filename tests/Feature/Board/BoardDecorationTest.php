<?php
declare(strict_types=1);

use Lattice\Board\Components\Board;
use Workbench\App\Boards\ClobberingTaskBoard;
use Workbench\App\Boards\ScopedTaskBoard;
use Workbench\App\Boards\TaskBoard;
use Workbench\App\Models\Task;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

it('decorates every card with its actions, serialized with the board context sealed in', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $board = $this->sealBoard(fn (): Board => Board::use(TaskBoard::class));
    $todo = array_column($board['props']['result']['columns'], null, 'key')['todo'];
    $card = array_values(array_filter($todo['cards'], fn (array $card): bool => $card['id'] === $writeSpec->id))[0];

    expect($card['actions'])->toHaveCount(1)
        ->and($card['actions'][0]['type'])->toBe('action')
        ->and($card['actions'][0]['props']['endpoint'])->toBe('/lattice/actions/workbench.board.delete-task')
        ->and($card['actions'][0]['props']['ref'])->toBeString();

    postJson($card['actions'][0]['props']['endpoint'], [], ['X-Lattice-Ref' => $card['actions'][0]['props']['ref']])
        ->assertOk();

    expect(Task::query()->whereKey($writeSpec->id)->exists())->toBeFalse();
});

it('omits the actions key for a card whose definition returns no cardActions', function (): void {
    seedTaskBoard();

    $board = $this->sealBoard(fn (): Board => Board::use(ScopedTaskBoard::class, ['assignee' => 'Anna']));
    $card = $board['props']['result']['columns'][0]['cards'][0];

    expect($card)->not->toHaveKey('actions')
        ->and($card['cardUrl'])->toBe('/tasks/'.$card['id']);
});

it('lets cardData()/cardUrl() decorate cards, while actions and cardUrl stay reserved keys cardData cannot clobber', function (): void {
    Task::factory()->status('todo')->position(0)->create(['title' => 'Guarded task']);

    $board = $this->sealBoard(fn (): Board => Board::use(ClobberingTaskBoard::class));
    $card = $board['props']['result']['columns'][0]['cards'][0];

    expect($card['cardUrl'])->toBe('/tasks/'.$card['id'])
        ->and($card['actions'])->toHaveCount(1)
        ->and($card['actions'][0]['type'])->toBe('action');
});

it('applies the same decoration to load-more endpoint responses', function (): void {
    foreach (range(0, 1) as $position) {
        Task::factory()->status('todo')->position($position)->create(['title' => "Task {$position}"]);
    }

    $board = $this->sealBoard(fn (): Board => Board::use(ClobberingTaskBoard::class));

    $response = getJson(
        $board['props']['endpoint'].'?column=todo&offset=0&limit=1',
        ['X-Lattice-Ref' => $board['props']['ref']],
    );

    $response->assertOk();
    $card = $response->json('columns.0.cards.0');

    expect($card['cardUrl'])->toBe('/tasks/'.$card['id'])
        ->and($card['actions'])->toHaveCount(1)
        ->and($card['actions'][0]['type'])->toBe('action');
});
