<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsWireNode;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Enums\FilterControl;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsFilter extends AsWireNode
{
    public function __construct(FilterControl|string $control)
    {
        parent::__construct(Wire::scalar($control));
    }
}
