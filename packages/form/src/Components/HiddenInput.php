<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;

#[AsField(FieldType::HiddenInput)]
class HiddenInput extends Field {}
