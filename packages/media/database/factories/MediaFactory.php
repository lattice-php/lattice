<?php
declare(strict_types=1);

namespace Lattice\Media\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Lattice\Media\Models\Media;

/**
 * @extends Factory<Media>
 */
final class MediaFactory extends Factory
{
    /** @return class-string<Media> */
    #[\Override]
    public function modelName(): string
    {
        return Media::modelClass();
    }

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = $this->faker->unique()->word().'.jpg';

        return [
            'disk' => 'public',
            'path' => 'media/'.Str::uuid()->toString().'.jpg',
            'name' => $name,
            'mime_type' => 'image/jpeg',
            'size' => $this->faker->numberBetween(1_000, 500_000),
        ];
    }

    public function document(): static
    {
        return $this->state(fn (): array => [
            'mime_type' => 'application/pdf',
            'name' => $this->faker->unique()->word().'.pdf',
            'path' => 'media/'.Str::uuid()->toString().'.pdf',
        ]);
    }
}
