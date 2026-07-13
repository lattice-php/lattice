<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

/**
 * How a family's loose union alias carries its payload on the wire: effects
 * spread their props flat next to `type`; node-like families nest them under
 * `props`.
 */
enum WireShape
{
    case Flat;
    case Nested;
}
