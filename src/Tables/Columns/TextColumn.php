<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;

#[Attributes\Column(type: 'text', props: TextColumnProps::class)]
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

    public function filterType(): FilterType
    {
        if ($this->date !== null) {
            return FilterType::Date;
        }

        if ($this->boolean) {
            return FilterType::Boolean;
        }

        if ($this->numeric) {
            return FilterType::Number;
        }

        return FilterType::Text;
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

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: ColumnType::Text,
            width: $this->resolvedWidth(),
            sortable: $this->sortableValue(),
            filter: $this->filterValue(),
            props: new TextColumnProps(
                date: $this->date,
                copyable: $this->copyable,
                link: $this->link,
            ),
        );
    }
}
