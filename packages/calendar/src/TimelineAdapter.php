<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

interface TimelineAdapter
{
    /** @return list<ResourceGroup> */
    public function groups(): array;

    /** @return iterable<Entry> */
    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable;

    public function reschedule(Request $request): Entry;
}
