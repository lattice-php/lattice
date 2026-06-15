<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;

#[AsColumn(ColumnType::Text)]
class TextColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    /**
     * @var array{format: string|null}|null
     */
    public ?array $date = null;

    public bool $copyable = false;

    /**
     * @var array{href: string|null, external: bool}|null
     */
    public ?array $link = null;

    public function date(?string $format = null): static
    {
        $this->date = ['format' => $format];

        return $this;
    }

    public function filterType(): FilterType
    {
        return $this->date !== null ? FilterType::Date : FilterType::Text;
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
}
