<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Lattice\Calendar\AsTimeline;
use Lattice\Calendar\TimelineDefinition;

#[AsTimeline('denied')]
final class DeniedTimeline extends TimelineDefinition
{
    #[\Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function groups(): array
    {
        return [];
    }

    public function events(CarbonImmutable $from, CarbonImmutable $until): iterable
    {
        return [];
    }
}
