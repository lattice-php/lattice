<?php
declare(strict_types=1);

namespace Lattice\Calendar;

/**
 * Adapter capability required when a calendar enables the timeline view: the
 * timeline lays events out in lanes per resource, grouped by these groups.
 */
interface ProvidesCalendarResources
{
    /** @return list<ResourceGroup> */
    public function groups(): array;
}
