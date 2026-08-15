<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use InvalidArgumentException;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;

/**
 * A single calendar event with half-open `[start, end)` bounds. Plain `Y-m-d`
 * strings mark the event as all-day; any other input is normalized to a
 * floating local `Y-m-d\TH:i:s` wall time without timezone information.
 */
final class CalendarEvent
{
    public string $label = '';

    public ?Color $color = null;

    public ?string $resourceId = null;

    /** @var array<string, mixed> */
    public array $context = [];

    private string $start;

    private string $end;

    private bool $allDay;

    private function __construct(
        public readonly string $id,
        DateTimeInterface|string $start,
        DateTimeInterface|string $end,
    ) {
        $this->allDay = $this->isPlainDate($start) && $this->isPlainDate($end);
        $this->start = $this->normalize($start);
        $this->end = $this->normalize($end);

        $this->guardOrder();
    }

    public static function make(string $id, DateTimeInterface|string $start, DateTimeInterface|string $end): self
    {
        return new self($id, $start, $end);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function color(Color|ColorName|string $color): self
    {
        $this->color = Color::from($color);

        return $this;
    }

    public function resource(string $resourceId): self
    {
        $this->resourceId = $resourceId;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public function context(array $context): self
    {
        $this->context = $context;

        return $this;
    }

    public function allDay(bool $allDay = true): self
    {
        if ($allDay === $this->allDay) {
            return $this;
        }

        if ($allDay) {
            $this->start = substr($this->start, 0, 10);
            // A timed end after midnight still occupies its calendar day, so
            // the exclusive all-day bound moves to the next day; an exact
            // midnight end already is the exclusive bound.
            $this->end = str_ends_with($this->end, 'T00:00:00')
                ? substr($this->end, 0, 10)
                : CarbonImmutable::parse(substr($this->end, 0, 10))->addDay()->format('Y-m-d');
        } else {
            $this->start .= 'T00:00:00';
            $this->end .= 'T00:00:00';
        }

        $this->allDay = $allDay;

        $this->guardOrder();

        return $this;
    }

    public function data(): CalendarEventData
    {
        return new CalendarEventData(
            $this->id,
            $this->start,
            $this->end,
            $this->allDay,
            $this->label,
            $this->resourceId,
            $this->color,
            $this->context,
        );
    }

    private function isPlainDate(DateTimeInterface|string $date): bool
    {
        return is_string($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1;
    }

    private function normalize(DateTimeInterface|string $date): string
    {
        if ($this->allDay) {
            /** @var string $date */
            return $date;
        }

        return $date instanceof DateTimeInterface
            ? $date->format('Y-m-d\TH:i:s')
            : CarbonImmutable::parse($date)->format('Y-m-d\TH:i:s');
    }

    private function guardOrder(): void
    {
        if ($this->end <= $this->start) {
            throw new InvalidArgumentException(sprintf('Calendar event [%s] end must be after its start.', $this->id));
        }
    }
}
