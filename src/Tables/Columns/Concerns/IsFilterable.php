<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Columns\ColumnFilterOption;
use Lattice\Lattice\Tables\Concerns\ResolvesFilterOptions;
use Lattice\Lattice\Tables\Enums\FilterControl;
use Lattice\Lattice\Tables\Enums\FilterType;
use UnitEnum;

trait IsFilterable
{
    use ResolvesFilterOptions;

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

    protected bool $filterSearchable = false;

    /**
     * @var list<ColumnFilterOption>
     */
    protected array $filterClauseOptions = [];

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
     * Filter this column with a dropdown instead of the operator input. Pass an
     * enum, an associative `value => label` array, a list of options, or an
     * {@see OptionSource} (e.g. an Eloquent relation). Single selection matches
     * with `=`; `multiple` matches any with `in`. `searchable` (only with a
     * source) fetches options as the user types.
     *
     * @param  class-string<UnitEnum>|array<mixed>|OptionSource  $options
     */
    public function filterOptions(array|string|OptionSource $options, bool $multiple = false, bool $searchable = false): static
    {
        $this->filterable = true;
        $this->filterControl = FilterControl::Select;
        $this->filterMultiple = $multiple;
        $this->filterSearchable = $searchable;
        $this->filterClauseOptions = [];

        if ($options instanceof OptionSource) {
            $this->optionSource = $options;
            $this->filterSelectOptions = [];
        } else {
            $this->optionSource = null;
            [$this->filterSelectOptions, $this->filterClauseOptions] = $this->expandFilterOptions($options);
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
        return $this->resolveOptions($this->filterSelectOptions);
    }

    public function filterMultiple(): bool
    {
        return $this->filterMultiple;
    }

    public function filterSearchable(): bool
    {
        return $this->filterSearchable && $this->hasOptionSource();
    }

    /**
     * @return list<ColumnFilterOption>
     */
    public function filterClauseOptions(): array
    {
        return $this->filterClauseOptions;
    }

    /**
     * @return list<Option>
     */
    public function searchFilterOptions(string $query): array
    {
        return $this->searchOptionSource($query);
    }

    /**
     * @return array<int, Op>
     */
    public function availableOperators(): array
    {
        if ($this->filterControl === FilterControl::Select) {
            $operators = $this->filterMultiple ? [Op::In, Op::NotIn] : [Op::Equals, Op::NotEquals];

            foreach ($this->filterClauseOptions as $option) {
                foreach ($option->clauses as $clause) {
                    $operators[] = $clause->operator;
                }
            }

            $unique = [];

            foreach ($operators as $operator) {
                $unique[$operator->value] = $operator;
            }

            return array_values($unique);
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
     * @param  class-string<UnitEnum>|array<mixed>  $options
     * @return array{0: list<Option>, 1: list<ColumnFilterOption>}
     */
    private function expandFilterOptions(array|string $options): array
    {
        if (is_string($options) || ! array_is_list($options)) {
            return [Option::expand($options), []];
        }

        $selectOptions = [];
        $clauseOptions = [];

        foreach ($options as $option) {
            if ($option instanceof ColumnFilterOption) {
                $selectOptions[] = new Option($option->label, $option->value);
                $clauseOptions[] = $option;

                continue;
            }

            $selectOptions[] = Option::expand([$option])[0];
        }

        return [$selectOptions, $clauseOptions];
    }
}
