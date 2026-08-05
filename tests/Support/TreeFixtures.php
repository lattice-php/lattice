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

/**
 * The base tree plus a second expandable root, so a browser case can expand
 * one branch while another stays collapsed. Kept separate from
 * {@see seedCategoryTree()} because the feature suite pins the exact root list.
 */
function seedLazyCategories(): Category
{
    $electronics = seedCategoryTree();
    $clothing = Category::factory()->create(['name' => 'Clothing']);
    Category::factory()->childOf($clothing)->create(['name' => 'Men']);

    return $electronics;
}

function categoryId(string $name): string
{
    return (string) Category::query()->where('name', $name)->value('id');
}
