<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Concerns\ResolvesFilterOptions;
use Lattice\Lattice\Tables\Enums\FilterControl;
use Lattice\Lattice\Tables\Filters\Rules\AllowedFilterValues;

/**
 * A dropdown filter. Single by default ({@see Builder::where}); `multiple()`
 * matches any of the selected values ({@see Builder::whereIn}). Options can be a
 * fixed list ({@see options}) or come from an {@see OptionSource} via {@see optionsFrom}.
 */
#[AsFilter(FilterControl::Select)]
class SelectFilter extends Filter
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
     * @return array<int, Select>
     */
    #[\Override]
    public function schema(): array
    {
        $field = Select::make('value', $this->label)
            ->multiple($this->multiple);

        if ($this->placeholder !== null) {
            $field->placeholder($this->placeholder);
        }

        if ($this->hasOptionSource()) {
            $field->optionsFrom($this->optionSource);
        } else {
            $field->options($this->options);
        }

        $rules = $this->multiple ? ['array'] : ['string'];

        if (! $this->hasOptionSource() && $this->options !== []) {
            $rules[] = $this->allowedValuesRule();
        }

        return [$field->rules($rules)];
    }

    /**
     * @return string|list<string|FilterIndicator|array{label?: string, value: mixed}>|array<string, mixed>|null
     */
    #[\Override]
    public function indicator(FormData $data): string|array|null
    {
        $values = $this->normalizeValues($data->get('value'));

        if ($values === []) {
            return null;
        }

        $labels = $this->labelsFor($values);

        return $this->multiple ? implode(', ', $labels) : ($labels[0] ?? null);
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

    public function apply(Builder $builder, FormData $data): void
    {
        $value = $data->get('value');

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

    private function allowedValuesRule(): ValidationRule
    {
        return new AllowedFilterValues($this->optionValues(), $this->multiple);
    }

    /**
     * @param  list<string>  $values
     * @return list<string>
     */
    private function labelsFor(array $values): array
    {
        $options = $this->hasOptionSource()
            ? $this->optionSource->selected($values)
            : $this->options;
        $labels = [];

        foreach ($values as $value) {
            $option = collect($options)->first(fn (Option $option): bool => $option->value === $value);
            $labels[] = $option instanceof Option ? $option->label : $value;
        }

        return $labels;
    }
}
