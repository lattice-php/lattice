<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Illuminate\Http\Request;

/**
 * Adapter capability that enables drag-to-reschedule: without it the
 * calendar's PATCH endpoint responds 405 and the client renders read-only.
 */
interface ReschedulesCalendarEvents
{
    public function reschedule(Request $request): CalendarEvent;
}
