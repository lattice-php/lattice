<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Task;

/** @extends Factory<Task> */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(4),
            'status' => 'todo',
            'position' => 0,
            'assignee' => null,
        ];
    }

    public function status(string $status): static
    {
        return $this->state(['status' => $status]);
    }

    public function position(int $position): static
    {
        return $this->state(['position' => $position]);
    }
}
