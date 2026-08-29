<?php
declare(strict_types=1);

use Workbench\App\Actions\MoveTaskAction;
use Workbench\App\Models\Task;

it('moves a task into another column and resequences both columns', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $this->callAction(MoveTaskAction::class, [
        'cardId' => (string) $writeSpec->id,
        'columnKey' => 'doing',
        'position' => 0,
    ], ['board' => 'tasks'])->assertOk();

    $reviewPr = Task::query()->where('title', 'Review PR')->firstOrFail();
    $buildFeature = Task::query()->where('title', 'Build feature')->firstOrFail();

    expect($reviewPr->refresh()->status)->toBe('todo')
        ->and($reviewPr->refresh()->position)->toBe(0)
        ->and($writeSpec->refresh()->status)->toBe('doing')
        ->and($writeSpec->refresh()->position)->toBe(0)
        ->and($buildFeature->refresh()->status)->toBe('doing')
        ->and($buildFeature->refresh()->position)->toBe(1);
});

it('reorders a task within its own column', function (): void {
    seedTaskBoard();
    $reviewPr = Task::query()->where('title', 'Review PR')->firstOrFail();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $this->callAction(MoveTaskAction::class, [
        'cardId' => (string) $reviewPr->id,
        'columnKey' => 'todo',
        'position' => 0,
    ], ['board' => 'tasks'])->assertOk();

    expect($reviewPr->refresh()->position)->toBe(0)
        ->and($writeSpec->refresh()->position)->toBe(1);
});

it('fails when the planner rejects the move', function (): void {
    seedTaskBoard();

    $this->callAction(MoveTaskAction::class, [
        'cardId' => 'ghost',
        'columnKey' => 'todo',
        'position' => 0,
    ], ['board' => 'tasks'])
        ->assertStatus(422);
});

it('fails when the destination column does not belong to the board', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $this->callAction(MoveTaskAction::class, [
        'cardId' => (string) $writeSpec->id,
        'columnKey' => 'archived',
        'position' => 0,
    ], ['board' => 'tasks'])
        ->assertStatus(422);

    expect($writeSpec->refresh()->status)->toBe('todo');
});

it('validates the move payload', function (): void {
    seedTaskBoard();

    $this->callAction(MoveTaskAction::class, [
        'cardId' => '',
        'columnKey' => '',
        'position' => -1,
    ], ['board' => 'tasks'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['cardId', 'columnKey', 'position']);
});
