<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Columns\Concerns\IsFilterable;
use Lattice\Table\Columns\Concerns\IsSearchable;
use Lattice\Table\Columns\Concerns\IsSortable;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Searchable;
use Lattice\Table\Contracts\Sortable;
use Lattice\Table\Enums\ColumnType;
use Lattice\Table\Enums\FilterType;
use Lattice\Table\RelationBinding;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Enums\DateTimeStyle;

#[AsColumn(ColumnType::Text)]
final class TextColumn extends Column implements Filterable, Searchable, Sortable
{
    use HasCopyable;
    use IsFilterable;
    use IsSearchable;
    use IsSortable;

    /**
     * @var array{dateStyle: DateTimeStyle|null, timeStyle: DateTimeStyle|null}|null
     */
    public ?array $date = null;

    /**
     * @var array{href: string|null, external: bool}|null
     */
    public ?array $link = null;

    /**
     * @var array{colorKey: string}|null
     */
    public ?array $badge = null;

    public ?string $multiple = null;

    public function date(DateTimeStyle $style = DateTimeStyle::Medium): static
    {
        $this->date = ['dateStyle' => $style, 'timeStyle' => null];

        return $this;
    }

    public function time(DateTimeStyle $style = DateTimeStyle::Medium): static
    {
        $this->date = ['dateStyle' => null, 'timeStyle' => $style];

        return $this;
    }

    public function dateTime(DateTimeStyle $style = DateTimeStyle::Medium): static
    {
        $this->date = ['dateStyle' => $style, 'timeStyle' => $style];

        return $this;
    }

    /**
     * Render the value as a coloured badge. The colour is read from the sibling
     * field named by $colorKey — a colour name (`green`) or any CSS colour
     * (`#16a34a`); unset falls back to gray. $colorKey is a key on the row for a
     * scalar column, or a key on each related row for a {@see multiple()} column.
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
        return $this->multiple === null && $this->sortableEnabled;
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
    public function relationBinding(): ?RelationBinding
    {
        if ($this->multiple !== null) {
            return new RelationBinding($this->key(), $this->multiple, many: true, colorField: $this->badge['colorKey'] ?? null);
        }

        return parent::relationBinding();
    }
}
