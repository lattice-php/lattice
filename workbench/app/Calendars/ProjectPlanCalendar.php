<?php
declare(strict_types=1);

namespace Workbench\App\Calendars;

use Lattice\Calendar\AsCalendar;
use Lattice\Calendar\CalendarAdapter;
use Lattice\Calendar\CalendarDefinition;

#[AsCalendar('project-plan')]
final class ProjectPlanCalendar extends CalendarDefinition
{
    public function adapter(): CalendarAdapter
    {
        return app(ProjectPlanCalendarAdapter::class);
    }
}
