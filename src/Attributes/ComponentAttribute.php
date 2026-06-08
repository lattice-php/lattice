<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Attributes;

abstract class ComponentAttribute
{
    public function __construct(public readonly string $key) {}
}
