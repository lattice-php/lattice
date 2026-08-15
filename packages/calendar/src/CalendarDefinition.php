<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Lattice\Core\Definition;

/**
 * A registered, addressable calendar: the server-side counterpart of
 * `Calendar::use()`. The registry key from {@see AsCalendar} lets the lazy
 * endpoint re-resolve the definition on a later request, with the sealed
 * context re-applied by the controller.
 */
abstract class CalendarDefinition extends Definition
{
    abstract public function adapter(): CalendarAdapter;
}
