<?php
declare(strict_types=1);

use Workbench\App\Models\Task;

/**
 * Two todo, one doing, one done task, ordered by position within each
 * column — the shape the wire, endpoint, and paging tests all assert
 * against.
 */
function seedTaskBoard(): void
{
    Task::factory()->status('todo')->position(0)->create(['title' => 'Write spec', 'assignee' => 'Anna']);
    Task::factory()->status('todo')->position(1)->create(['title' => 'Review PR', 'assignee' => 'Ben']);
    Task::factory()->status('doing')->position(0)->create(['title' => 'Build feature', 'assignee' => 'Anna']);
    Task::factory()->status('done')->position(0)->create(['title' => 'Ship release', 'assignee' => 'Ben']);
}
