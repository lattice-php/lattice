<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Lattice\Calendar\Components\Calendar;
use Lattice\Core\DefinitionRegistry;
use Throwable;

/**
 * @extends DefinitionRegistry<CalendarDefinition>
 */
final class CalendarRegistry extends DefinitionRegistry
{
    /**
     * Events for the requested `[from, to)` window, `to` exclusive.
     *
     * @return array{events: list<CalendarEventData>}
     */
    public function response(string $key, Request $request, ?CalendarDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        $from = $this->parseDate((string) $request->query('from', ''));
        $until = $this->parseDate((string) $request->query('to', ''));

        if (! $from instanceof CarbonImmutable || ! $until instanceof CarbonImmutable || $until->lessThanOrEqualTo($from)) {
            abort(422);
        }

        return ['events' => array_map(
            static fn (CalendarEvent $event): CalendarEventData => $event->data(),
            $this->eventList($definition->adapter()->events($from, $until)),
        )];
    }

    /** @return array{event: CalendarEventData} */
    public function reschedule(Request $request, CalendarDefinition $definition): array
    {
        $adapter = $definition->adapter();

        abort_unless($adapter instanceof ReschedulesCalendarEvents, 405);

        return ['event' => $adapter->reschedule($request)->data()];
    }

    private function parseDate(string $value): ?CarbonImmutable
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            return null;
        }

        try {
            $date = CarbonImmutable::createFromFormat('Y-m-d', $value)?->startOfDay();

            return $date?->format('Y-m-d') === $value ? $date : null;
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  iterable<int, CalendarEvent>  $events
     * @return list<CalendarEvent>
     */
    private function eventList(iterable $events): array
    {
        return is_array($events) ? array_values($events) : iterator_to_array($events, false);
    }

    /**
     * @param  class-string<CalendarDefinition>  $calendar
     * @param  array<string, mixed>  $context
     */
    public function component(string $calendar, array $context = []): Calendar
    {
        return $this->gatedComponent(
            $calendar,
            fn (string $key): Calendar => Calendar::make($key),
            fn (CalendarDefinition $definition, Calendar $component, string $key): Calendar => $component
                ->id($key)
                ->endpoint($this->endpointFor($key))
                ->definition($definition),
            $context,
        );
    }

    protected function definitionClass(): string
    {
        return CalendarDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsCalendar::class;
    }

    protected function name(): string
    {
        return 'calendar';
    }

    public function group(): string
    {
        return 'calendars';
    }
}
