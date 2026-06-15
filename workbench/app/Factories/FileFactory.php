<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\File;

/**
 * @extends Factory<File>
 */
class FileFactory extends Factory
{
    protected $model = File::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->bothify('image-####.webp');

        return [
            'disk' => 's3',
            'path' => 'workbench/products/'.$name,
            'name' => $name,
            'mime_type' => 'image/webp',
            'size' => fake()->numberBetween(5_000, 50_000),
        ];
    }
}
