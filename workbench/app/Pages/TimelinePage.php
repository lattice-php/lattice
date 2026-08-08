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
                    Text::make('A read-only resource-planning board rendered by the lattice-php/calendar component package.'),
                    Timeline::use(ProjectPlanTimeline::class),
                ]),
        ]);
    }
}
