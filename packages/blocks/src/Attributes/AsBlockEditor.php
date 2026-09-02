<?php
declare(strict_types=1);

namespace Lattice\Blocks\Attributes;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsBlockEditor extends DefinitionAttribute {}
