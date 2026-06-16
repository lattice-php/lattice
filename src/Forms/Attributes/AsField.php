<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Forms\Enums\FieldType;

#[Attribute(Attribute::TARGET_CLASS)]
class AsField extends AsComponent
{
    public function __construct(FieldType|string $type)
    {
        parent::__construct(FieldType::wireType($type));
    }
}
