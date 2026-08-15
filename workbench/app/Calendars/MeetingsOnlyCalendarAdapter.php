<?php
declare(strict_types=1);

namespace Workbench\App\Calendars;

use Carbon\CarbonImmutable;
use Lattice\Calendar\CalendarAdapter;

final class MeetingsOnlyCalendarAdapter implements CalendarAdapter
{
    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        return [];
    }
}
