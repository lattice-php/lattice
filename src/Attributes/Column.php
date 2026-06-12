<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Column extends Component
{
    /**
     * @param  class-string  $props  the column's props value object
     */
    public function __construct(string $type, public readonly string $props)
    {
        parent::__construct($type);
    }
}
