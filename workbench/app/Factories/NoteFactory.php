<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Note;

/** @extends Factory<Note> */
class NoteFactory extends Factory
{
    protected $model = Note::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'type' => 'internal',
            'body' => fake()->sentence(),
        ];
    }

    public function external(): static
    {
        return $this->state(['type' => 'external']);
    }
}
