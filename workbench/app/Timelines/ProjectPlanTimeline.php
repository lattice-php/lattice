<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Carbon\CarbonImmutable;
use Lattice\Calendar\AsTimeline;
use Lattice\Calendar\Entry;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\TimelineDefinition;

#[AsTimeline('project-plan')]
final class ProjectPlanTimeline extends TimelineDefinition
{
    /**
     * @return list<ResourceGroup>
     */
    public function groups(): array
    {
        return [
            ResourceGroup::make('projects', 'Projekte')->resources([
                ['id' => 'website-relaunch', 'label' => 'Website Relaunch'],
                ['id' => 'mobile-app', 'label' => 'Mobile App'],
            ]),
            ResourceGroup::make('employees', 'Mitarbeiter')->resources([
                ['id' => 'anna', 'label' => 'Anna Bauer'],
                ['id' => 'ben', 'label' => 'Ben Krüger'],
            ]),
        ];
    }

    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        $today = CarbonImmutable::today();

        $entries = [
            Entry::make('website-kickoff', 'website-relaunch', $today, $today->addDays(3))
                ->label('Kickoff')
                ->color('blue'),
            Entry::make('website-design', 'website-relaunch', $today->addDays(3), $today->addDays(8))
                ->label('Design')
                ->color('purple'),
            Entry::make('mobile-planning', 'mobile-app', $today->addDays(1), $today->addDays(5))
                ->label('Planning'),
            Entry::make('anna-website', 'anna', $today, $today->addDays(5))
                ->label('Website Relaunch')
                ->color('green'),
            Entry::make('ben-mobile', 'ben', $today->addDays(2), $today->addDays(6))
                ->label('Mobile App')
                ->color('orange'),
        ];

        return array_values(array_filter(
            $entries,
            static fn (Entry $entry): bool => $entry->start < $until->format('Y-m-d') && $entry->end > $from->format('Y-m-d'),
        ));
    }
}
