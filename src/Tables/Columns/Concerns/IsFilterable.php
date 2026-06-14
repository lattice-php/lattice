<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Enums\FilterControl;
use Lattice\Lattice\Tables\Enums\FilterType;

trait IsFilterable
{
    protected bool $filterable = false;

    protected ?Op $defaultOperator = null;

    /**
     * @var array<int, Op>|null
     */
    protected ?array $operators = null;

    protected ?FilterControl $filterControl = null;

    /**
     * @var list<Option>
     */
    protected array $filterSelectOptions = [];

    protected bool $filterMultiple = false;

    protected ?OptionSource $filterOptionSource = null;

    protected bool $filterSearchable = false;

    /**
     * @param  array<int, Op>  $operators  narrows the offered operators; defaults to the value type's full set
     */
    public function filterable(?Op $default = null, array $operators = []): static
    {
        $this->filterable = true;
        $this->defaultOperator = $default;
        $this->operators = $operators === [] ? null : array_values($operators);

        return $this;
    }

    /**
     * Filter this column with a dropdown instead of the operator input. Pass a
     * fixed list of options or an {@see OptionSource} (e.g. an Eloquent relation).
     * Single selection matches with `=`; `multiple` matches any with `in`.
     * `searchable` (only with a source) fetches options as the user types.
     *
     * @param  array<int, Option|array{label: string, value: string}>|OptionSource  $options
     */
    public function filterOptions(array|OptionSource $options, bool $multiple = false, bool $searchable = false): static
    {
        $this->filterable = true;
        $this->filterControl = FilterControl::Select;
        $this->filterMultiple = $multiple;
        $this->filterSearchable = $searchable;

        if ($options instanceof OptionSource) {
            $this->filterOptionSource = $options;
            $this->filterSelectOptions = [];
        } else {
            $this->filterOptionSource = null;
            $this->filterSelectOptions = $this->normalizeFilterOptions($options);
        }

        return $this;
    }

    public function isFilterable(): bool
    {
        return $this->filterable;
    }

    public function filterType(): FilterType
    {
        return FilterType::Text;
    }

    public function filterControl(): ?FilterControl
    {
        return $this->filterControl;
    }

    /**
     * @return list<Option>
     */
    public function filterSelectOptions(): array
    {
        return $this->filterOptionSource?->search('') ?? $this->filterSelectOptions;
    }

    public function filterMultiple(): bool
    {
        return $this->filterMultiple;
    }

    public function filterSearchable(): bool
    {
        return $this->filterSearchable && $this->filterOptionSource !== null;
    }

    /**
     * @return list<Option>
     */
    public function searchFilterOptions(string $query): array
    {
        return $this->filterOptionSource?->search($query) ?? [];
    }

    /**
     * @return array<int, Op>
     */
    public function availableOperators(): array
    {
        if ($this->filterControl === FilterControl::Select) {
            return $this->filterMultiple ? [Op::In, Op::NotIn] : [Op::Equals, Op::NotEquals];
        }

        return $this->operators ?? $this->filterType()->operators();
    }

    public function defaultFilterOperator(): Op
    {
        if ($this->filterControl === FilterControl::Select) {
            return $this->filterMultiple ? Op::In : Op::Equals;
        }

        return $this->defaultOperator ?? $this->filterType()->defaultOperator();
    }

    /**
     * @param  array<int, Option|array{label: string, value: string}>  $options
     * @return list<Option>
     */
    private function normalizeFilterOptions(array $options): array
    {
        return array_values(array_map(
            static fn (Option|array $option): Option => $option instanceof Option
                ? $option
                : new Option((string) $option['label'], (string) $option['value']),
            $options,
        ));
    }
}
