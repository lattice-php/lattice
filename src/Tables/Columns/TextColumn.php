<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

use Bambamboole\Lattice\Tables\Columns\Concerns\IsFilterable;
use Bambamboole\Lattice\Tables\Columns\Concerns\IsSortable;
use Bambamboole\Lattice\Tables\Enums\ControlType;

class TextColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    /**
     * @var array{format: string|null}|null
     */
    protected ?array $date = null;

    protected bool $boolean = false;

    protected bool $numeric = false;

    protected bool $copyable = false;

    /**
     * @var array{href: string|null, external: bool}|null
     */
    protected ?array $link = null;

    public function date(?string $format = null): static
    {
        $this->date = ['format' => $format];

        return $this;
    }

    public function boolean(bool $boolean = true): static
    {
        $this->boolean = $boolean;

        return $this;
    }

    public function numeric(bool $numeric = true): static
    {
        $this->numeric = $numeric;

        return $this;
    }

    public function controlType(): ControlType
    {
        if ($this->date !== null) {
            return ControlType::Date;
        }

        if ($this->boolean) {
            return ControlType::Boolean;
        }

        if ($this->numeric) {
            return ControlType::Number;
        }

        return ControlType::Text;
    }

    public function copyable(bool $copyable = true): static
    {
        $this->copyable = $copyable;

        return $this;
    }

    public function link(?string $href = null, bool $external = false): static
    {
        $this->link = [
            'href' => $href,
            'external' => $external,
        ];

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(): array
    {
        return array_filter([
            ...parent::toArray(),
            ...$this->sortableToArray(),
            ...$this->filterToArray(),
            'type' => 'text',
            'date' => $this->date,
            'copyable' => $this->copyable ?: null,
            'link' => $this->link,
        ], fn (mixed $value): bool => $value !== null);
    }
}
