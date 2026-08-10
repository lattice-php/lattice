<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Lattice\Calendar\Entry;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\TimelineAdapter;
use Workbench\App\Models\ProjectPlanAssignment;

final class ProjectPlanTimelineAdapter implements TimelineAdapter
{
    /** @return list<ResourceGroup> */
    public function groups(): array
    {
        return [
            ResourceGroup::make('resources', 'Planbare Ressourcen')->resources($this->resources()),
        ];
    }

    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        return ProjectPlanAssignment::query()
            ->where('starts_on', '<', $until->format('Y-m-d'))
            ->where('ends_on', '>', $from->format('Y-m-d'))
            ->orderBy('id')
            ->get()
            ->map($this->entry(...));
    }

    public function reschedule(Request $request): Entry
    {
        $resourceIds = array_column($this->resources(), 'id');

        /** @var array{id: string, resourceId: string, start: string, end: string} $data */
        $data = $request->validate([
            'id' => ['required', 'string', Rule::exists(ProjectPlanAssignment::class, 'id')],
            'resourceId' => ['required', 'string', Rule::in($resourceIds)],
            'start' => ['required', 'date_format:Y-m-d'],
            'end' => ['required', 'date_format:Y-m-d', 'after:start'],
        ], [
            'id.exists' => __('workbench.calendar.assignment-unavailable'),
            'resourceId.in' => __('workbench.calendar.resource-unavailable'),
        ]);

        $assignment = DB::transaction(function () use ($data): ProjectPlanAssignment {
            $assignment = ProjectPlanAssignment::query()->lockForUpdate()->findOrFail($data['id']);
            $assignment->update([
                'resource_id' => $data['resourceId'],
                'starts_on' => $data['start'],
                'ends_on' => $data['end'],
            ]);

            return $assignment;
        });

        return $this->entry($assignment);
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

    private function entry(ProjectPlanAssignment $assignment): Entry
    {
        $entry = Entry::make(
            $assignment->id,
            $assignment->resource_id,
            $assignment->starts_on,
            $assignment->ends_on,
        )->label($assignment->label);

        if ($assignment->color !== null) {
            $entry->color($assignment->color);
        }

        return $entry;
    }
}
