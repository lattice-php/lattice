<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Attribute;
use Lattice\Core\Attributes\DefinitionAttribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class AsCalendar extends DefinitionAttribute {}
