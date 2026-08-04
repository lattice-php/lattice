<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsWireNode;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsColumn extends AsWireNode
{
    public function __construct(ColumnType|string $type)
    {
        parent::__construct(ColumnType::wireType($type));
    }
}
