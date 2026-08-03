<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Attribute;
use Lattice\Lattice\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsTree extends DefinitionAttribute {}
