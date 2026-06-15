<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * Marks a table column and declares its type — the column equivalent of the
 * #[Component] attribute it extends. Built-ins pass the ColumnType enum for
 * type-safety; consumers pass a raw string. Like a component, a column's wire
 * props are reflected from its public properties, so no props class is declared.
 */
#[Attribute(Attribute::TARGET_CLASS)]
class AsColumn extends Component
{
    public function __construct(ColumnType|string $type)
    {
        parent::__construct($type instanceof ColumnType ? $type->value : $type);
    }
}
