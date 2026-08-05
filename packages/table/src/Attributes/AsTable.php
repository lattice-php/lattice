<?php
declare(strict_types=1);

namespace Lattice\Table\Attributes;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
class AsTable extends DefinitionAttribute {}
