<?php
declare(strict_types=1);

namespace Lattice\Calendar\Components;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use InvalidArgumentException;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Calendar\CalendarAdapter;
use Lattice\Calendar\CalendarDefinition;
use Lattice\Calendar\CalendarEvent;
use Lattice\Calendar\CalendarEventData;
use Lattice\Calendar\CalendarRegistry;
use Lattice\Calendar\CalendarView;
use Lattice\Calendar\ProvidesCalendarResources;
use Lattice\Calendar\ReschedulesCalendarEvents;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\ResourceGroupData;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\IsInteractive;
use LogicException;

#[AsComponent('calendar')]
class Calendar extends Component implements InteractiveComponent
{
    use IsInteractive;

    public ?string $endpoint = null;

    /** @var list<CalendarView> */
    public array $views = [CalendarView::Month];

    public CalendarView $defaultView = CalendarView::Month;

    public string $date;

    public int $days = 90;

    /** @var list<ResourceGroupData> */
    public array $groups = [];

    /** @var list<CalendarEventData> */
    public array $events = [];

    public bool $reschedulable = false;

    public ?Action $eventAction = null;

    public ?Action $dayAction = null;

    private ?CalendarDefinition $definition = null;

    private bool $defaultViewChosen = false;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * Build a calendar from a registered {@see CalendarDefinition}: the
     * definition's adapter populates the board, and the sealed reference lets
     * the endpoint re-resolve it with the same context on a later request.
     *
     * @param  class-string<CalendarDefinition>  $definition
     * @param  array<string, mixed>  $context
     */
    public static function use(string $definition, array $context = []): static
    {
        /** @var static */
        return app(CalendarRegistry::class)->component($definition, $context);
    }

    /**
     * @param  list<CalendarView>  $views
     */
    public function views(array $views): static
    {
        $unique = [];

        foreach ($views as $view) {
            if (! in_array($view, $unique, true)) {
                $unique[] = $view;
            }
        }

        if ($unique === []) {
            throw new InvalidArgumentException('A calendar needs at least one view.');
        }

        $this->views = $unique;

        return $this;
    }

    public function defaultView(CalendarView $view): static
    {
        $this->defaultView = $view;
        $this->defaultViewChosen = true;

        return $this;
    }

    public function date(DateTimeInterface|string $date): static
    {
        $this->date = $date instanceof DateTimeInterface
            ? $date->format('Y-m-d')
            : CarbonImmutable::parse($date)->format('Y-m-d');

        return $this;
    }

    public function days(int $days): static
    {
        if ($days < 1) {
            throw new InvalidArgumentException('Calendar days must be one or greater.');
        }

        $this->days = $days;

        return $this;
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function definition(CalendarDefinition $definition): static
    {
        $this->definition = $definition;

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function eventAction(string $action, array $context = []): static
    {
        $this->eventAction = Action::use($action, $context);

        return $this;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function dayAction(string $action, array $context = []): static
    {
        $this->dayAction = Action::use($action, $context);

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function prepareBoard(array $data): array
    {
        $this->resolveDefaultView();

        $date = isset($this->date) ? CarbonImmutable::parse($this->date) : CarbonImmutable::today();
        $this->date = $date->format('Y-m-d');

        $adapter = $this->definition?->adapter();

        if (! $adapter instanceof CalendarAdapter) {
            return $data;
        }

        if (in_array(CalendarView::Timeline, $this->views, true)) {
            if (! $adapter instanceof ProvidesCalendarResources) {
                throw new LogicException(sprintf(
                    'Calendar [%s] enables the timeline view but its adapter %s does not implement %s.',
                    $this->definition::class,
                    $adapter::class,
                    ProvidesCalendarResources::class,
                ));
            }

            $this->groups = array_map(
                static fn (ResourceGroup $group): ResourceGroupData => $group->data(),
                $adapter->groups(),
            );
        }

        $this->reschedulable = $adapter instanceof ReschedulesCalendarEvents;

        [$from, $until] = $this->window($date);

        $this->events = array_map(
            static fn (CalendarEvent $event): CalendarEventData => $event->data(),
            $this->eventList($adapter->events($from, $until)),
        );

        return $data;
    }

    private function resolveDefaultView(): void
    {
        if (in_array($this->defaultView, $this->views, true)) {
            return;
        }

        if ($this->defaultViewChosen) {
            throw new LogicException(sprintf(
                'Calendar default view [%s] is not among its enabled views.',
                $this->defaultView->value,
            ));
        }

        $this->defaultView = $this->views[0];
    }

    /**
     * The union of every enabled view's initial window. The month view pads
     * seven days on either side because the client's locale week start is
     * unknown here; the timeline view starts exactly at the anchor date.
     *
     * @return array{CarbonImmutable, CarbonImmutable}
     */
    private function window(CarbonImmutable $date): array
    {
        $monthStart = $date->startOfMonth();
        $month = in_array(CalendarView::Month, $this->views, true)
            ? [$monthStart->subDays(7), $monthStart->addMonth()->addDays(7)]
            : null;
        $timeline = in_array(CalendarView::Timeline, $this->views, true)
            ? [$date, $date->addDays($this->days)]
            : null;

        if ($month === null || $timeline === null) {
            return $month ?? $timeline ?? [$date, $date->addDays($this->days)];
        }

        return [$month[0]->min($timeline[0]), $month[1]->max($timeline[1])];
    }

    /**
     * @param  iterable<int, CalendarEvent>  $events
     * @return list<CalendarEvent>
     */
    private function eventList(iterable $events): array
    {
        return is_array($events) ? array_values($events) : iterator_to_array($events, false);
    }
}
