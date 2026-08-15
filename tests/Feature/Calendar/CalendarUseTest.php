<?php
declare(strict_types=1);

use Carbon\CarbonImmutable;
use Lattice\Calendar\CalendarEvent;
use Lattice\Calendar\CalendarView;
use Lattice\Calendar\Components\Calendar;
use Workbench\App\Actions\PlanCalendarDayAction;
use Workbench\App\Actions\ShowCalendarEventAction;
use Workbench\App\Calendars\DeniedCalendar;
use Workbench\App\Calendars\MeetingsOnlyCalendar;
use Workbench\App\Calendars\ProjectPlanCalendar;
use Workbench\App\Seeders\ProjectPlanAssignmentSeeder;

beforeEach(function (): void {
    $this->travelTo(CarbonImmutable::parse('2026-08-13 09:00:00'));
    app(ProjectPlanAssignmentSeeder::class)->run();
});

it('builds an interactive multi-view calendar from a definition', function (): void {
    $today = CarbonImmutable::today();

    $node = wire(Calendar::use(ProjectPlanCalendar::class)
        ->views([CalendarView::Month, CalendarView::Timeline])
        ->date($today)
        ->days(10));

    expect($node['type'])->toBe('calendar')
        ->and($node['props']['endpoint'])->toBe('/lattice/calendars/project-plan')
        ->and($node['props']['ref'])->toBeString()
        ->and($node['props']['views'])->toBe(['month', 'timeline'])
        ->and($node['props']['defaultView'])->toBe('month')
        ->and($node['props']['date'])->toBe($today->format('Y-m-d'))
        ->and($node['props']['days'])->toBe(10)
        ->and($node['props']['reschedulable'])->toBeTrue()
        ->and(array_column($node['props']['groups'], 'key'))->toBe(['resources'])
        ->and($node['props']['groups'][0]['resources'])->toBe([
            ['id' => 'team-website', 'label' => 'Website Team'],
            ['id' => 'team-mobile', 'label' => 'Mobile Team'],
            ['id' => 'anna', 'label' => 'Anna Bauer'],
            ['id' => 'ben', 'label' => 'Ben Krüger'],
        ])
        ->and(array_column($node['props']['events'], 'id'))
        ->toContain('website-team', 'website-anna', 'mobile-team', 'mobile-ben', 'sprint-review', 'company-retreat');
});

it('defaults the date to today when not set', function (): void {
    $node = wire(Calendar::use(ProjectPlanCalendar::class));

    expect($node['props']['date'])->toBe('2026-08-13');
});

it('leaves groups empty when the timeline view is not enabled', function (): void {
    $node = wire(Calendar::use(ProjectPlanCalendar::class)->views([CalendarView::Month]));

    expect($node['props']['groups'])->toBe([]);
});

it('adopts the first view as the default when none is chosen', function (): void {
    $node = wire(Calendar::use(ProjectPlanCalendar::class)->views([CalendarView::Timeline]));

    expect($node['props']['defaultView'])->toBe('timeline');
});

it('throws when the chosen default view is not enabled', function (): void {
    wire(Calendar::use(ProjectPlanCalendar::class)
        ->views([CalendarView::Timeline])
        ->defaultView(CalendarView::Month));
})->throws(LogicException::class);

it('rejects an empty view list', function (): void {
    Calendar::use(ProjectPlanCalendar::class)->views([]);
})->throws(InvalidArgumentException::class);

it('throws when the timeline view is enabled without a resource-providing adapter', function (): void {
    wire(Calendar::use(MeetingsOnlyCalendar::class)->views([CalendarView::Month, CalendarView::Timeline]));
})->throws(LogicException::class, 'timeline view');

it('marks a calendar without a rescheduling adapter as read-only', function (): void {
    $node = wire(Calendar::use(MeetingsOnlyCalendar::class));

    expect($node['props']['reschedulable'])->toBeFalse();
});

it('does not serialize events outside the initial window', function (): void {
    $node = wire(Calendar::use(ProjectPlanCalendar::class)
        ->views([CalendarView::Month])
        ->date(CarbonImmutable::today()->addMonths(3)));

    expect($node['props']['events'])->toBe([]);
});

it('rejects a non-positive number of days', function (int $days): void {
    Calendar::use(ProjectPlanCalendar::class)->days($days);
})->with([0, -1])->throws(InvalidArgumentException::class);

it('serializes the actions as sealed action nodes', function (): void {
    $node = wire(Calendar::use(ProjectPlanCalendar::class)
        ->eventAction(ShowCalendarEventAction::class)
        ->dayAction(PlanCalendarDayAction::class));

    expect($node['props']['eventAction'])->toMatchArray(['type' => 'action'])
        ->and($node['props']['eventAction']['props']['ref'])->toBeString()
        ->and($node['props']['dayAction'])->toMatchArray(['type' => 'action'])
        ->and($node['props']['dayAction']['props']['ref'])->toBeString();
});

it('infers an all-day event from plain dates', function (): void {
    $event = CalendarEvent::make('e1', '2026-08-01', '2026-08-03')->data();

    expect($event->allDay)->toBeTrue()
        ->and($event->start)->toBe('2026-08-01')
        ->and($event->end)->toBe('2026-08-03');
});

it('normalizes datetime input to a floating timed event', function (): void {
    $event = CalendarEvent::make('e1', '2026-08-01 09:00', CarbonImmutable::parse('2026-08-01 10:30'))->data();

    expect($event->allDay)->toBeFalse()
        ->and($event->start)->toBe('2026-08-01T09:00:00')
        ->and($event->end)->toBe('2026-08-01T10:30:00');
});

it('converts a timed event to all-day bounds on override', function (): void {
    $sameDay = CalendarEvent::make('e1', '2026-08-01T09:00:00', '2026-08-01T10:00:00')->allDay()->data();
    $midnightEnd = CalendarEvent::make('e2', '2026-08-01T09:00:00', '2026-08-02T00:00:00')->allDay()->data();

    expect($sameDay->allDay)->toBeTrue()
        ->and($sameDay->start)->toBe('2026-08-01')
        ->and($sameDay->end)->toBe('2026-08-02')
        ->and($midnightEnd->end)->toBe('2026-08-02');
});

it('throws when an event end is not after its start', function (string $start, string $end): void {
    CalendarEvent::make('bad', $start, $end);
})->with([
    ['2026-08-10', '2026-08-10'],
    ['2026-08-10', '2026-08-09'],
    ['2026-08-10T10:00:00', '2026-08-10T10:00:00'],
    ['2026-08-10T10:00:00', '2026-08-10T09:00:00'],
])->throws(InvalidArgumentException::class);

it('serializes an event color', function (): void {
    $event = wire(CalendarEvent::make('e1', '2026-08-01', '2026-08-02')->color('blue')->data());

    expect($event['color'])->toBe(['kind' => 'named', 'value' => 'blue', 'dark' => null]);
});

it('serializes resource binding and action context', function (): void {
    $event = wire(CalendarEvent::make('e1', '2026-08-01', '2026-08-02')
        ->resource('anna')
        ->context(['kind' => 'assignment'])
        ->data());

    expect($event['resourceId'])->toBe('anna')
        ->and($event['context'])->toBe(['kind' => 'assignment'])
        ->and($event['color'])->toBeNull();
});

it('hides the calendar when the definition denies authorization', function (): void {
    expect(Calendar::use(DeniedCalendar::class)->shouldRender())->toBeFalse();
});

it('keeps interactive props inert on plain calendars', function (): void {
    $node = wire(Calendar::make());

    expect($node['props']['ref'])->toBeNull()
        ->and($node['props']['endpoint'])->toBeNull()
        ->and($node['props']['groups'])->toBe([])
        ->and($node['props']['events'])->toBe([])
        ->and($node['props']['reschedulable'])->toBeFalse();
});
