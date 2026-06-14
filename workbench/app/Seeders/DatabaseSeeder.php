<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ProductSeeder::class,
            GroupSeeder::class,
            BusinessPartnerSeeder::class,
            SalesPriceSeeder::class,
            SalesOrderSeeder::class,
        ]);
    }
}
