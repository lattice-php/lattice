<?php

declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            WorkbenchUserSeeder::class,
            WorkbenchProductSeeder::class,
        ]);
    }
}
