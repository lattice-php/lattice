<?php
declare(strict_types=1);

use Workbench\App\Actions\DeleteTaskAction;
use Workbench\App\Models\Task;

it('deletes the task addressed by the trusted card_id context', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $this->callAction(DeleteTaskAction::class, [], [
        'board' => 'tasks',
        'card_id' => $writeSpec->id,
    ])->assertOk();

    expect(Task::query()->whereKey($writeSpec->id)->exists())->toBeFalse();
});

it('404s when card_id does not resolve to a task', function (): void {
    $this->callAction(DeleteTaskAction::class, [], [
        'board' => 'tasks',
        'card_id' => 999_999,
    ])->assertNotFound();
});

it('404s when the board context is missing', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $this->callAction(DeleteTaskAction::class, [], [
        'card_id' => $writeSpec->id,
    ])->assertNotFound();

    expect(Task::query()->whereKey($writeSpec->id)->exists())->toBeTrue();
});
