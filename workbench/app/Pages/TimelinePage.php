<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Calendar\Components\Timeline;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Timelines\ProjectPlanTimeline;

#[AsPage(route: '/timeline')]
final class TimelinePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Timeline';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('timeline-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make('Drag an existing assignment to reschedule it across teams and employees.'),
                    Timeline::use(ProjectPlanTimeline::class),
                ]),
        ]);
    }
}
