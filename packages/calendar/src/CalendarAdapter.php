<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;

interface CalendarAdapter
{
    /**
     * Events overlapping the half-open `[$from, $until)` window; both bounds
     * arrive at start of day. Timed events go on the wire as floating local
     * wall time without timezone information.
     *
     * @return iterable<CalendarEvent>
     */
    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable;
}
