<?php
declare(strict_types=1);

use Workbench\App\Models\Category;

/**
 * Three levels under Electronics plus a root leaf — the shape the wire,
 * endpoint, and lazy-depth tests all assert against.
 */
function seedCategoryTree(): Category
{
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
    Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);
    Category::factory()->create(['name' => 'Books']);

    return $electronics;
}
