<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * Marks a table filter and declares its control, using the same wire type
 * machinery as components. Built-ins pass the FilterControl enum for
 * type-safety; consumers pass a raw string to declare a custom control the
 * client renders through an augmented FilterProps map. Like a column, a filter's
 * wire props are reflected from its public properties, so no props class is declared.
 */
#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsFilter extends AsComponent
{
    public function __construct(FilterControl|string $control)
    {
        parent::__construct($control instanceof FilterControl ? $control->value : $control);
    }
}
