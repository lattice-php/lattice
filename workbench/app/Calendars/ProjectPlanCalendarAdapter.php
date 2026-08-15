<?php
declare(strict_types=1);

namespace Workbench\App\Calendars;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Lattice\Calendar\CalendarAdapter;
use Lattice\Calendar\CalendarEvent;
use Lattice\Calendar\ProvidesCalendarResources;
use Lattice\Calendar\ReschedulesCalendarEvents;
use Lattice\Calendar\ResourceGroup;
use Workbench\App\Models\ProjectPlanAssignment;

final class ProjectPlanCalendarAdapter implements CalendarAdapter, ProvidesCalendarResources, ReschedulesCalendarEvents
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
        $assignments = ProjectPlanAssignment::query()
            ->where('starts_on', '<', $until->format('Y-m-d'))
            ->where('ends_on', '>', $from->format('Y-m-d'))
            ->orderBy('id')
            ->get()
            ->map($this->event(...))
            ->all();

        $meetings = array_values(array_filter(
            $this->meetings(),
            static fn (CalendarEvent $event): bool => substr($event->data()->start, 0, 10) < $until->format('Y-m-d')
                && $event->data()->end > $from->format('Y-m-d'),
        ));

        return [...$assignments, ...$meetings];
    }

    public function reschedule(Request $request): CalendarEvent
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

        return $this->event($assignment);
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

    private function event(ProjectPlanAssignment $assignment): CalendarEvent
    {
        $event = CalendarEvent::make(
            $assignment->id,
            $assignment->starts_on->format('Y-m-d'),
            $assignment->ends_on->format('Y-m-d'),
        )
            ->resource($assignment->resource_id)
            ->label($assignment->label)
            ->context(['kind' => 'assignment']);

        if ($assignment->color !== null) {
            $event->color($assignment->color);
        }

        return $event;
    }

    /**
     * Resource-less events exercising the month view: several timed events on
     * one day (overflowing the visible lanes) and a multi-day all-day event.
     *
     * @return list<CalendarEvent>
     */
    private function meetings(): array
    {
        $today = CarbonImmutable::today();

        return [
            CalendarEvent::make(
                'company-retreat',
                $today->addDays(16)->format('Y-m-d'),
                $today->addDays(19)->format('Y-m-d'),
            )->label('Company Retreat')->color('teal')->context(['kind' => 'meeting']),
            CalendarEvent::make(
                'sprint-review',
                $today->format('Y-m-d\T09:00:00'),
                $today->format('Y-m-d\T10:00:00'),
            )->label('Sprint Review')->color('blue')->context(['kind' => 'meeting']),
            CalendarEvent::make(
                'design-sync',
                $today->format('Y-m-d\T10:30:00'),
                $today->format('Y-m-d\T11:15:00'),
            )->label('Design Sync')->context(['kind' => 'meeting']),
            CalendarEvent::make(
                'retro',
                $today->format('Y-m-d\T15:00:00'),
                $today->format('Y-m-d\T16:00:00'),
            )->label('Team Retro')->color('purple')->context(['kind' => 'meeting']),
            CalendarEvent::make(
                'one-on-one',
                $today->format('Y-m-d\T16:30:00'),
                $today->format('Y-m-d\T17:00:00'),
            )->label('1:1 Anna & Ben')->context(['kind' => 'meeting']),
        ];
    }
}
