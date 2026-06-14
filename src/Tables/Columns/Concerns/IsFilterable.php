<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

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
     * Filter this column with a dropdown of fixed options instead of the operator
     * input. Single selection matches with `=`; `multiple` matches any with `in`.
     *
     * @param  array<int, Option|array{label: string, value: string}>  $options
     */
    public function filterOptions(array $options, bool $multiple = false): static
    {
        $this->filterable = true;
        $this->filterControl = FilterControl::Select;
        $this->filterSelectOptions = $this->normalizeFilterOptions($options);
        $this->filterMultiple = $multiple;

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
        return $this->filterSelectOptions;
    }

    public function filterMultiple(): bool
    {
        return $this->filterMultiple;
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
