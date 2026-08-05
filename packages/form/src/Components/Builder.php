<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Concerns\HasRowActions;
use Lattice\Form\Components\Concerns\HasRowLayout;
use Lattice\Form\Enums\FieldType;

#[AsField(FieldType::Builder)]
class Builder extends TypedRowsField
{
    use HasRowActions;
    use HasRowLayout;
}
