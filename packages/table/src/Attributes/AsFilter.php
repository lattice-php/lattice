<?php
declare(strict_types=1);

namespace Lattice\Table\Attributes;

use Attribute;
use Lattice\Core\Attributes\AsWireNode;
use Lattice\Core\Support\Wire;
use Lattice\Table\Enums\FilterControl;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsFilter extends AsWireNode
{
    public function __construct(FilterControl|string $control)
    {
        parent::__construct(Wire::scalar($control));
    }
}
