<?php
declare(strict_types=1);

use Workbench\App\Models\Task;

it('drags a task card into another column and persists the move', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $page = $this->visitAsWorkbenchUser('/board')
        ->assertSee('Write spec')
        ->assertSee('Ship release');

    assertPresentEventually($page, "[data-test=\"board-card-{$writeSpec->id}\"]");

    $page->drag(
        "[data-test=\"board-card-{$writeSpec->id}\"]",
        '[data-test="board-column-done"] ul',
    );

    assertPresentEventually(
        $page,
        "[data-test=\"board-column-done\"] [data-test=\"board-card-{$writeSpec->id}\"]",
    );

    retryUntil(function () use ($writeSpec): void {
        expect($writeSpec->refresh()->status)->toBe('done');
    });

    $page->assertNoJavaScriptErrors();
});

it('reorders a task within its own column with a real pointer drag', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();
    $planRelease = Task::factory()->status('todo')->position(2)->create(['title' => 'Plan release']);

    // A non-adjacent target: whichever edge the pointer resolves to, the
    // dragged card lands away from its original index-0 slot either way, so
    // the assertion below is not sensitive to that resolution.
    $page = $this->visitAsWorkbenchUser('/board')
        ->assertSee('Write spec')
        ->assertSee('Plan release');

    assertPresentEventually($page, "[data-test=\"board-card-{$planRelease->id}\"]");

    $page->drag(
        "[data-test=\"board-card-{$writeSpec->id}\"]",
        "[data-test=\"board-card-{$planRelease->id}\"]",
    );

    retryUntil(function () use ($writeSpec): void {
        expect($writeSpec->refresh()->status)->toBe('todo')
            ->and($writeSpec->position)->not->toBe(0);
    });

    $page->assertNoJavaScriptErrors();
});

it('narrows the board to matching cards via the toolbar search', function (): void {
    seedTaskBoard();

    $page = $this->visitAsWorkbenchUser('/board')
        ->assertSee('Write spec')
        ->assertSee('Review PR')
        ->assertSee('Build feature')
        ->assertSee('Ship release');

    $page->fill('[data-test="table-search"]', 'Anna');

    assertDontSeeEventually($page, 'Review PR');

    $page->assertSee('Write spec')
        ->assertSee('Build feature')
        ->assertDontSee('Ship release')
        ->assertNoJavaScriptErrors();
});

it('optimistically removes a card via the context menu delete action', function (): void {
    seedTaskBoard();
    $writeSpec = Task::query()->where('title', 'Write spec')->firstOrFail();

    $page = $this->visitAsWorkbenchUser('/board')
        ->assertSee('Write spec');

    assertPresentEventually($page, "[data-test=\"board-card-{$writeSpec->id}\"]");

    $page->click("[data-test=\"board-card-{$writeSpec->id}-actions\"]")
        ->click('@action-delete-task')
        ->assertSee('Delete task')
        ->click('@confirm-accept');

    assertDontSeeEventually($page, 'Write spec');

    retryUntil(function () use ($writeSpec): void {
        expect(Task::query()->whereKey($writeSpec->id)->exists())->toBeFalse();
    });

    $page->assertNoJavaScriptErrors();
});

it('quick-adds a card to a column and persists it', function (): void {
    seedTaskBoard();

    $page = $this->visitAsWorkbenchUser('/board')
        ->assertSee('Write spec');

    $page->click('[data-test="board-quick-add-done"]');

    assertPresentEventually($page, '[data-test="board-quick-add-done-input"]');

    $page
        ->fill('[data-test="board-quick-add-done-input"]', 'Write release notes')
        ->keys('[data-test="board-quick-add-done-input"]', ['Enter']);

    $page->assertSee('Write release notes');

    retryUntil(function (): void {
        $task = Task::query()->where('title', 'Write release notes')->firstOrFail();

        expect($task->status)->toBe('done');
    });

    $page->assertNoJavaScriptErrors();
});
