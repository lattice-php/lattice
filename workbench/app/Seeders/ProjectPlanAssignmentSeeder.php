<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Workbench\App\Models\ProjectPlanAssignment;

final class ProjectPlanAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $today = CarbonImmutable::today();

        foreach ([
            [
                'id' => 'website-team',
                'resource_id' => 'team-website',
                'label' => 'Website Relaunch',
                'starts_on' => $today,
                'ends_on' => $today->addDays(5),
                'color' => 'blue',
            ],
            [
                'id' => 'website-anna',
                'resource_id' => 'anna',
                'label' => 'Website Relaunch',
                'starts_on' => $today,
                'ends_on' => $today->addDays(5),
                'color' => 'green',
            ],
            [
                'id' => 'mobile-team',
                'resource_id' => 'team-mobile',
                'label' => 'Mobile App',
                'starts_on' => $today->addDay(),
                'ends_on' => $today->addDays(6),
                'color' => 'purple',
            ],
            [
                'id' => 'mobile-ben',
                'resource_id' => 'ben',
                'label' => 'Mobile App',
                'starts_on' => $today->addDays(2),
                'ends_on' => $today->addDays(6),
                'color' => 'orange',
            ],
        ] as $assignment) {
            ProjectPlanAssignment::query()->firstOrCreate(['id' => $assignment['id']], $assignment);
        }
    }
}
