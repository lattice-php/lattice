<?php
declare(strict_types=1);

use Lattice\Board\Components\Board;
use Workbench\App\Boards\DeniedBoard;
use Workbench\App\Boards\ScopedTaskBoard;
use Workbench\App\Boards\TaskBoard;

it('builds an interactive board from a definition', function (): void {
    seedTaskBoard();

    $node = wire(Board::use(TaskBoard::class, ['tenant' => 7]));

    expect($node['type'])->toBe('board')
        ->and($node['props']['endpoint'])->toBe('/lattice/boards/tasks')
        ->and($node['props']['ref'])->toBeString()
        ->and($node['props']['perColumn'])->toBe(25)
        ->and(array_column($node['props']['columns'], 'key'))->toBe(['todo', 'doing', 'done'])
        ->and($node['props']['columns'][0])->toMatchArray(['key' => 'todo', 'label' => 'To Do', 'icon' => null])
        ->and($node['props']['columns'][0]['color'])->toBe(['kind' => 'named', 'value' => 'gray', 'dark' => null]);
});

it('serializes the card template once as the component schema', function (): void {
    seedTaskBoard();

    $node = wire(Board::use(TaskBoard::class));

    expect($node['schema'])->toHaveCount(1)
        ->and($node['schema'][0]['type'])->toBe('stack')
        ->and($node['schema'][0]['schema'][0]['type'])->toBe('text')
        ->and($node['schema'][0]['schema'][0]['props']['dataBindings'])->toBe(['text' => 'title']);
});

it('populates the initial result with per-column cards ordered by position', function (): void {
    seedTaskBoard();

    $node = wire(Board::use(TaskBoard::class));

    $columns = array_column($node['props']['result']['columns'], null, 'key');

    expect(array_column($columns['todo']['cards'], 'title'))->toBe(['Write spec', 'Review PR'])
        ->and($columns['todo']['total'])->toBe(2)
        ->and($columns['todo']['hasMore'])->toBeFalse()
        ->and($columns['todo']['offset'])->toBe(0)
        ->and($columns['doing']['total'])->toBe(1)
        ->and($columns['done']['total'])->toBe(1);
});

it('applies cardData() to every card', function (): void {
    seedTaskBoard();

    $node = wire(Board::use(TaskBoard::class));

    $todo = array_column($node['props']['result']['columns'], null, 'key')['todo'];

    expect(array_column($todo['cards'], 'assigneeInitial'))->toBe(['A', 'B']);
});

it('re-applies the sealed context to the initial result', function (): void {
    seedTaskBoard();

    $node = wire(Board::use(ScopedTaskBoard::class, ['assignee' => 'Anna']));

    $todo = array_column($node['props']['result']['columns'], null, 'key')['todo'];

    expect(array_column($todo['cards'], 'title'))->toBe(['Write spec']);
});

it('hides the board when the definition denies authorization', function (): void {
    expect(Board::use(DeniedBoard::class)->shouldRender())->toBeFalse();
});

it('keeps interactive props inert on a plain board', function (): void {
    $node = wire(Board::make());

    expect($node['props']['ref'])->toBeNull()
        ->and($node['props']['endpoint'])->toBeNull()
        ->and($node['props']['columns'])->toBe([])
        ->and($node['props']['result'])->toBeNull();
});
