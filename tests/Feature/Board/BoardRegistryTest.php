<?php
declare(strict_types=1);

use Lattice\Board\BoardRegistry;
use Lattice\Core\Exceptions\UnknownComponent;
use Workbench\App\Boards\TaskBoard;

it('resolves a discovered board definition by its attribute key', function (): void {
    expect(app(BoardRegistry::class)->resolve('tasks'))->toBeInstanceOf(TaskBoard::class);
});

it('throws UnknownComponent for an unknown key', function (): void {
    app(BoardRegistry::class)->resolve('nope');
})->throws(UnknownComponent::class);

it('builds the board endpoint from the group convention', function (): void {
    expect(app(BoardRegistry::class)->endpointFor('tasks'))
        ->toBe('/lattice/boards/tasks');
});
