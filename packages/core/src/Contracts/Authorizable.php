<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

use Illuminate\Http\Request;
use Lattice\Core\Authorization;

/**
 * The one method a definition or page overrides to gate itself. Callers never
 * invoke it directly — {@see Authorization} composes it with the abilities
 * declared on the class attribute.
 */
interface Authorizable
{
    public function authorize(Request $request): bool;
}
