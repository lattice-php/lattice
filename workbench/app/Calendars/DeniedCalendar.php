<?php
declare(strict_types=1);

namespace Workbench\App\Calendars;

use Illuminate\Http\Request;
use Lattice\Calendar\AsCalendar;
use Lattice\Calendar\CalendarAdapter;
use Lattice\Calendar\CalendarDefinition;

#[AsCalendar('denied')]
final class DeniedCalendar extends CalendarDefinition
{
    #[\Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function adapter(): CalendarAdapter
    {
        return app(ProjectPlanCalendarAdapter::class);
    }
}
