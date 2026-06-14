<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Contracts;

use JsonSerializable;

/**
 * The effect contract: a value object that serializes to `{ type, ...payload }`.
 * Built-ins extend the abstract Effect base; advanced consumers may implement
 * this directly. The wire `type` is the PHP↔JS discriminant.
 */
interface Effect extends JsonSerializable
{
    public function wireType(): string;
}
