<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Component
{
    public function __construct(public readonly string $type) {}
}
