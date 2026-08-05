<?php
declare(strict_types=1);

namespace Lattice\Form\Attributes;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
class AsForm extends DefinitionAttribute {}
