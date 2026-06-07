<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Table
{
    public function __construct(public readonly string $key) {}
}
