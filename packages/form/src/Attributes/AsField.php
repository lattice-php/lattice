<?php
declare(strict_types=1);

namespace Lattice\Form\Attributes;

use Attribute;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Form\Enums\FieldType;

#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsField extends AsComponent
{
    public function __construct(FieldType|string $type)
    {
        parent::__construct(FieldType::wireType($type));
    }
}
