<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Concerns\ResolvesFilterOptions;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A dropdown filter. Single by default ({@see Builder::where}); `multiple()`
 * matches any of the selected values ({@see Builder::whereIn}). Options can be a
 * fixed list ({@see options}) or come from an {@see OptionSource} via {@see optionsFrom}.
 */
#[AsFilter(FilterControl::Select)]
class SelectFilter extends BaseFilter
{
    use HasOptions;
    use HasPlaceholder;
    use ResolvesFilterOptions;

    public bool $multiple = false;

    public bool $searchable = false;

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    /**
     * Resolve options from an {@see OptionSource} (e.g. an Eloquent relation)
     * instead of a fixed list, keeping the filter free of any persistence concern.
     */
    public function optionsFrom(OptionSource $source): static
    {
        $this->optionSource = $source;

        return $this;
    }

    /**
     * Fetch options as the user types instead of shipping the full list up front.
     * Only meaningful with an {@see optionsFrom} source.
     */
    public function searchable(bool $searchable = true): static
    {
        $this->searchable = $searchable;

        return $this;
    }

    public function isSearchable(): bool
    {
        return $this->searchable && $this->hasOptionSource();
    }

    /**
     * @return list<Option>
     */
    public function searchOptions(string $query): array
    {
        return $this->searchOptionSource($query);
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props['options'] = $this->resolveOptions($this->options);
        $props['searchable'] = $this->isSearchable();

        return $props;
    }

    public function apply(Builder $builder, mixed $value): void
    {
        if ($this->multiple) {
            $values = $this->normalizeValues($value);

            if ($values !== []) {
                $builder->whereIn($this->column(), $values);
            }

            return;
        }

        if (is_string($value) && $value !== '') {
            $builder->where($this->column(), $value);
        }
    }

    /**
     * @return list<string>
     */
    private function normalizeValues(mixed $value): array
    {
        return array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, is_array($value) ? $value : [$value]),
            static fn (string $item): bool => $item !== '',
        ));
    }
}
