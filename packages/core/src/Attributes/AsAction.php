<?php
declare(strict_types=1);

namespace Lattice\Core\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class AsAction extends DefinitionAttribute {}
