<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Calendar\CalendarView;
use Lattice\Calendar\Components\Calendar;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Actions\PlanCalendarDayAction;
use Workbench\App\Actions\ShowCalendarEventAction;
use Workbench\App\Calendars\ProjectPlanCalendar;

#[AsPage(route: '/calendar')]
final class CalendarPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Calendar';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('calendar-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make('Switch between the month grid and the resource timeline; drag an assignment in the timeline to reschedule it.'),
                    Calendar::use(ProjectPlanCalendar::class)
                        ->views([CalendarView::Month, CalendarView::Timeline])
                        ->eventAction(ShowCalendarEventAction::class)
                        ->dayAction(PlanCalendarDayAction::class),
                ]),
        ]);
    }
}
