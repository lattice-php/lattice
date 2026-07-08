<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * Marks a table filter and declares its control, using the same wire type
 * machinery as components. Like a column, a filter's wire props are reflected
 * from its public properties, so no props class is declared.
 */
#[Attribute(Attribute::TARGET_CLASS)]
class AsFilter extends AsComponent
{
    public function __construct(FilterControl $control)
    {
        parent::__construct($control->value);
    }
}
