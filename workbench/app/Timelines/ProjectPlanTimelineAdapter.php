<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Calendar\Entry;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\TimelineAdapter;

final class ProjectPlanTimelineAdapter implements TimelineAdapter
{
    /** @var array<string, Entry> */
    private array $entries = [];

    /** @return list<ResourceGroup> */
    public function groups(): array
    {
        return [
            ResourceGroup::make('resources', 'Planbare Ressourcen')->resources($this->resources()),
        ];
    }

    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        return array_values(array_filter(
            $this->entries(),
            static fn (Entry $entry): bool => $entry->start < $until->format('Y-m-d') && $entry->end > $from->format('Y-m-d'),
        ));
    }

    public function reschedule(Request $request): Entry
    {
        $entries = $this->entries();
        $resourceIds = array_column($this->resources(), 'id');
        $data = $request->validate([
            'id' => ['required', 'string', Rule::in(array_keys($entries))],
            'resourceId' => ['required', 'string', Rule::in($resourceIds)],
            'start' => ['required', 'date_format:Y-m-d'],
            'end' => ['required', 'date_format:Y-m-d', 'after:start'],
        ], [
            'id.in' => __('workbench.calendar.assignment-unavailable'),
            'resourceId.in' => __('workbench.calendar.resource-unavailable'),
        ]);

        $previous = $entries[$data['id']];
        $updated = Entry::make($previous->id, $data['resourceId'], $data['start'], $data['end'])
            ->label($previous->label);

        if ($previous->color !== null) {
            $updated->color($previous->color);
        }

        $this->entries[$updated->id] = $updated;

        return $updated;
    }

    /** @return list<array{id: string, label: string}> */
    private function resources(): array
    {
        return [
            ['id' => 'team-website', 'label' => 'Website Team'],
            ['id' => 'team-mobile', 'label' => 'Mobile Team'],
            ['id' => 'anna', 'label' => 'Anna Bauer'],
            ['id' => 'ben', 'label' => 'Ben Krüger'],
        ];
    }

    /** @return array<string, Entry> */
    private function entries(): array
    {
        if ($this->entries !== []) {
            return $this->entries;
        }

        $today = CarbonImmutable::today();
        $this->entries = [
            'website-team' => Entry::make('website-team', 'team-website', $today, $today->addDays(5))
                ->label('Website Relaunch')
                ->color('blue'),
            'website-anna' => Entry::make('website-anna', 'anna', $today, $today->addDays(5))
                ->label('Website Relaunch')
                ->color('green'),
            'mobile-team' => Entry::make('mobile-team', 'team-mobile', $today->addDay(), $today->addDays(6))
                ->label('Mobile App')
                ->color('purple'),
            'mobile-ben' => Entry::make('mobile-ben', 'ben', $today->addDays(2), $today->addDays(6))
                ->label('Mobile App')
                ->color('orange'),
        ];

        return $this->entries;
    }
}
