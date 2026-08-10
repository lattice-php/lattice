<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Lattice\Calendar\Components\Timeline;
use Lattice\Core\DefinitionRegistry;
use Throwable;

/**
 * @extends DefinitionRegistry<TimelineDefinition>
 */
final class TimelineRegistry extends DefinitionRegistry
{
    /**
     * Events for the requested `[from, to)` window, `to` exclusive.
     *
     * @return array{events: list<EntryData>}
     */
    public function response(string $key, Request $request, ?TimelineDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        $from = $this->parseDate((string) $request->query('from', ''));
        $until = $this->parseDate((string) $request->query('to', ''));

        if (! $from instanceof CarbonImmutable || ! $until instanceof CarbonImmutable || $until->lessThanOrEqualTo($from)) {
            abort(422);
        }

        return ['events' => array_map(
            static fn (Entry $entry): EntryData => $entry->data(),
            $this->entryList($definition->adapter()->events($from, $until)),
        )];
    }

    /** @return array{event: EntryData} */
    public function reschedule(Request $request, TimelineDefinition $definition): array
    {
        return ['event' => $definition->adapter()->reschedule($request)->data()];
    }

    private function parseDate(string $value): ?CarbonImmutable
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            return null;
        }

        try {
            $date = CarbonImmutable::createFromFormat('Y-m-d', $value)?->startOfDay();

            return $date?->format('Y-m-d') === $value ? $date : null;
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  iterable<int, Entry>  $entries
     * @return list<Entry>
     */
    private function entryList(iterable $entries): array
    {
        return is_array($entries) ? array_values($entries) : iterator_to_array($entries, false);
    }

    /**
     * @param  class-string<TimelineDefinition>  $timeline
     * @param  array<string, mixed>  $context
     */
    public function component(string $timeline, array $context = []): Timeline
    {
        return $this->gatedComponent(
            $timeline,
            fn (string $key): Timeline => Timeline::make($key),
            fn (TimelineDefinition $definition, Timeline $component, string $key): Timeline => $component
                ->id($key)
                ->endpoint($this->endpointFor($key))
                ->definition($definition),
            $context,
        );
    }

    protected function definitionClass(): string
    {
        return TimelineDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsTimeline::class;
    }

    protected function name(): string
    {
        return 'timeline';
    }

    public function group(): string
    {
        return 'timelines';
    }
}
