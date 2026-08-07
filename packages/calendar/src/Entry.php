<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use InvalidArgumentException;
use JsonSerializable;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;
use Lattice\Core\Support\Wire;

final class Entry implements JsonSerializable
{
    public string $label = '';

    public ?Color $color = null;

    public readonly string $start;

    public readonly string $end;

    private function __construct(
        public readonly string $id,
        public readonly string $resourceId,
        DateTimeInterface|string $start,
        DateTimeInterface|string $end,
    ) {
        $this->start = $this->normalize($start);
        $this->end = $this->normalize($end);

        if ($this->end <= $this->start) {
            throw new InvalidArgumentException(sprintf('Entry [%s] end must be after its start.', $id));
        }
    }

    public static function make(string $id, string $resourceId, DateTimeInterface|string $start, DateTimeInterface|string $end): self
    {
        return new self($id, $resourceId, $start, $end);
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

    private function normalize(DateTimeInterface|string $date): string
    {
        return $date instanceof DateTimeInterface ? $date->format('Y-m-d') : CarbonImmutable::parse($date)->format('Y-m-d');
    }

    /**
     * @return array{id: string, resourceId: string, start: string, end: string, label: string, color?: array<string, mixed>}
     */
    public function jsonSerialize(): array
    {
        $data = [
            'id' => $this->id,
            'resourceId' => $this->resourceId,
            'start' => $this->start,
            'end' => $this->end,
            'label' => $this->label,
        ];

        if ($this->color instanceof Color) {
            $data['color'] = Wire::toArray($this->color);
        }

        return $data;
    }
}
