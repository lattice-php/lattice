<?php
declare(strict_types=1);

namespace Lattice\Calendar\Components;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use InvalidArgumentException;
use Lattice\Calendar\Entry;
use Lattice\Calendar\EntryData;
use Lattice\Calendar\ResourceGroup;
use Lattice\Calendar\ResourceGroupData;
use Lattice\Calendar\TimelineDefinition;
use Lattice\Calendar\TimelineRegistry;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\IsInteractive;

#[AsComponent('timeline')]
class Timeline extends Component implements InteractiveComponent
{
    use IsInteractive;

    public ?string $endpoint = null;

    public string $from;

    public int $days = 90;

    /** @var list<ResourceGroupData> */
    public array $groups = [];

    /** @var list<EntryData> */
    public array $events = [];

    private ?TimelineDefinition $definition = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * Build a timeline from a registered {@see TimelineDefinition}: the
     * definition's groups and events populate the board, and the sealed
     * reference lets the endpoint re-resolve it with the same context on a
     * later request.
     *
     * @param  class-string<TimelineDefinition>  $definition
     * @param  array<string, mixed>  $context
     */
    public static function use(string $definition, array $context = []): static
    {
        /** @var static */
        return app(TimelineRegistry::class)->component($definition, $context);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function from(DateTimeInterface|string $from): static
    {
        $this->from = $from instanceof DateTimeInterface
            ? $from->format('Y-m-d')
            : CarbonImmutable::parse($from)->format('Y-m-d');

        return $this;
    }

    public function days(int $days): static
    {
        if ($days < 1) {
            throw new InvalidArgumentException('Timeline days must be one or greater.');
        }

        $this->days = $days;

        return $this;
    }

    public function definition(TimelineDefinition $definition): static
    {
        $this->definition = $definition;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function prepareBoard(array $data): array
    {
        $from = isset($this->from)
            ? CarbonImmutable::parse($this->from)
            : CarbonImmutable::today()->startOfWeek()->subWeek();

        $this->from = $from->format('Y-m-d');

        $this->groups = $this->definition instanceof TimelineDefinition
            ? array_map(fn (ResourceGroup $group): ResourceGroupData => $group->data(), $this->definition->groups())
            : [];

        $this->events = $this->definition instanceof TimelineDefinition
            ? array_map(
                fn (Entry $entry): EntryData => $entry->data(),
                $this->entryList($this->definition->events($from, $from->addDays($this->days))),
            )
            : [];

        return $data;
    }

    /**
     * @param  iterable<int, Entry>  $entries
     * @return list<Entry>
     */
    private function entryList(iterable $entries): array
    {
        return is_array($entries) ? array_values($entries) : iterator_to_array($entries, false);
    }
}
