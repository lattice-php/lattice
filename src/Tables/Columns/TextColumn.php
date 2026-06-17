<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Contracts\RelationProjection;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\MultipleRelationColumn;

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

    /**
     * @var array{colorKey: string}|null
     */
    public ?array $badge = null;

    public ?string $multiple = null;

    public function date(?string $format = null): static
    {
        $this->date = ['format' => $format];

        return $this;
    }

    /**
     * Render the value as a coloured badge. The tone colour is read from the
     * sibling field named by $colorKey — a key on the row for a scalar column, or
     * a key on each related row for a {@see multiple()} column. An unset colour
     * falls back to gray.
     */
    public function badge(string $colorKey = 'color'): static
    {
        $this->badge = ['colorKey' => $colorKey];

        return $this;
    }

    /**
     * Draw the value from a to-many relation named by this column's key, reading
     * $field from each related row. Renders the related values as a list (of
     * badges, when combined with {@see badge()}). A multiple column filters
     * through `whereHas` and is never sortable.
     */
    public function multiple(string $field): static
    {
        $this->multiple = $field;

        return $this;
    }

    public function filterType(): FilterType
    {
        return $this->date !== null ? FilterType::Date : FilterType::Text;
    }

    #[\Override]
    public function isSortable(): bool
    {
        return $this->multiple === null && $this->sortable;
    }

    #[\Override]
    public function relationProjection(Model $model): ?RelationProjection
    {
        if ($this->multiple !== null) {
            return MultipleRelationColumn::resolve($model, $this->key(), $this->multiple, $this->badge['colorKey'] ?? null);
        }

        return parent::relationProjection($model);
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
