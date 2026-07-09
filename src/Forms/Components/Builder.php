<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Concerns\HasRowActions;
use Lattice\Lattice\Forms\Components\Concerns\HasRowLayout;
use Lattice\Lattice\Forms\Enums\FieldType;

#[AsField(FieldType::Builder)]
class Builder extends TypedRowsField
{
    use HasRowActions;
    use HasRowLayout;
}
