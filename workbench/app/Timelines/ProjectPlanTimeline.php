<?php
declare(strict_types=1);

namespace Workbench\App\Timelines;

use Lattice\Calendar\AsTimeline;
use Lattice\Calendar\TimelineAdapter;
use Lattice\Calendar\TimelineDefinition;

#[AsTimeline('project-plan')]
final class ProjectPlanTimeline extends TimelineDefinition
{
    public function adapter(): TimelineAdapter
    {
        return app(ProjectPlanTimelineAdapter::class);
    }
}
