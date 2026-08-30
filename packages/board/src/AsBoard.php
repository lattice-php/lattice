<?php
declare(strict_types=1);

namespace Lattice\Board;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsBoard extends DefinitionAttribute {}
