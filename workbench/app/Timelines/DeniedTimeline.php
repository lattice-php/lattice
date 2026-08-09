<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Illuminate\Http\Request;
use Lattice\Calendar\AsTimeline;
use Lattice\Calendar\TimelineAdapter;
use Lattice\Calendar\TimelineDefinition;

#[AsTimeline('denied')]
final class DeniedTimeline extends TimelineDefinition
{
    #[\Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function adapter(): TimelineAdapter
    {
        return app(ProjectPlanTimelineAdapter::class);
    }
}
