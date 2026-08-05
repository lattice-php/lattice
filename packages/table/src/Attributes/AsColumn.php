<?php
declare(strict_types=1);

namespace Lattice\Table\Attributes;

use Attribute;
use Lattice\Core\Attributes\AsWireNode;
use Lattice\Table\Enums\ColumnType;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsColumn extends AsWireNode
{
    public function __construct(ColumnType|string $type)
    {
        parent::__construct(ColumnType::wireType($type));
    }
}
