<?php
declare(strict_types=1);

namespace Workbench\App\Calendars;

use Lattice\Calendar\AsCalendar;
use Lattice\Calendar\CalendarAdapter;
use Lattice\Calendar\CalendarDefinition;

/**
 * A month-only fixture whose adapter implements no optional capability:
 * enabling its timeline view must fail, and its PATCH endpoint must 405.
 */
#[AsCalendar('meetings-only')]
final class MeetingsOnlyCalendar extends CalendarDefinition
{
    public function adapter(): CalendarAdapter
    {
        return app(MeetingsOnlyCalendarAdapter::class);
    }
}
