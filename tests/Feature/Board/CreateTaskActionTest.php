<?php
declare(strict_types=1);

use Workbench\App\Actions\CreateTaskAction;
use Workbench\App\Models\Task;

it('creates a task at the end of the target column', function (): void {
    seedTaskBoard();

    $this->callAction(CreateTaskAction::class, [
        'column' => 'todo',
        'title' => 'New task',
    ], ['board' => 'tasks'])->assertOk();

    $task = Task::query()->where('title', 'New task')->firstOrFail();

    expect($task->status)->toBe('todo')
        ->and($task->position)->toBe(2);
});

it('starts an empty column at position zero', function (): void {
    $this->callAction(CreateTaskAction::class, [
        'column' => 'doing',
        'title' => 'First in progress',
    ], ['board' => 'tasks'])->assertOk();

    $task = Task::query()->where('title', 'First in progress')->firstOrFail();

    expect($task->position)->toBe(0);
});

it('fails when the column does not belong to the board', function (): void {
    seedTaskBoard();

    $this->callAction(CreateTaskAction::class, [
        'column' => 'archived',
        'title' => 'Nope',
    ], ['board' => 'tasks'])->assertStatus(422);

    expect(Task::query()->where('title', 'Nope')->exists())->toBeFalse();
});

it('validates the create payload', function (): void {
    $this->callAction(CreateTaskAction::class, [
        'column' => '',
        'title' => '',
    ], ['board' => 'tasks'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['column', 'title']);
});
