<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\Category;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::factory()->create(['name' => 'Electronics']);
        $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
        Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);
        Category::factory()->childOf($electronics)->create(['name' => 'Phones']);
        $clothing = Category::factory()->create(['name' => 'Clothing']);
        Category::factory()->childOf($clothing)->create(['name' => 'Men']);
        Category::factory()->childOf($clothing)->create(['name' => 'Women']);
        Category::factory()->create(['name' => 'Books']);
    }
}
