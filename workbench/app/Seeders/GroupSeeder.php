<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\Group;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Retail', 'Wholesale', 'VIP'] as $name) {
            Group::query()->firstOrCreate(['name' => $name]);
        }
    }
}
