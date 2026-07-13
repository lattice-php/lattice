<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Enums\FilterControl;
use Lattice\Lattice\Tables\Enums\FilterType;

/**
 * The wire shape of a column's filter capability. Built by a Filterable column
 * and generated to TypeScript. A null `control` renders the operator input; a
 * `select` control renders the shared options dropdown (sharing the table-filter
 * control components).
 */
#[TypeScript]
final readonly class ColumnFilter
{
    /**
     * @param  array<int, Op>  $operators
     * @param  list<Option>  $options
     * @param  list<ColumnFilterOption>  $clauseOptions
     */
    public function __construct(
        public FilterType $type,
        public array $operators,
        public Op $defaultOperator,
        public ?FilterControl $control = null,
        public array $options = [],
        public bool $multiple = false,
        public bool $searchable = false,
        public array $clauseOptions = [],
    ) {}
}
