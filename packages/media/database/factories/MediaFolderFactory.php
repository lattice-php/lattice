<?php
declare(strict_types=1);

namespace Lattice\Media\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Lattice\Media\Models\MediaFolder;

/**
 * @extends Factory<MediaFolder>
 */
final class MediaFolderFactory extends Factory
{
    protected $model = MediaFolder::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'parent_id' => null,
            'sort_order' => 0,
        ];
    }
}
