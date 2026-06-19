<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Lattice\Lattice\Http\LatticeResponse;

/**
 * @deprecated Use {@see LatticeResponse}. The fluent
 * effect response is shared by form handlers, controllers, and any other
 * endpoint — it is no longer form-specific.
 */
final readonly class FormResponse extends LatticeResponse {}
