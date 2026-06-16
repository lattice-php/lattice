<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Tables\Enums\ColumnType;

/**
 * Marks a table column and declares its type, using the same wire type
 * machinery as components. Built-ins pass the ColumnType enum for
 * type-safety; consumers pass a raw string, which is normalized into the
 * column.* wire namespace. Like a component, a column's wire props are
 * reflected from its public properties, so no props class is declared.
 */
#[Attribute(Attribute::TARGET_CLASS)]
class AsColumn extends AsComponent
{
    public function __construct(ColumnType|string $type)
    {
        parent::__construct(ColumnType::wireType($type));
    }
}
