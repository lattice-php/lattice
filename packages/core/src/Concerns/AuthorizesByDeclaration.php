<?php
declare(strict_types=1);

namespace Lattice\Core\Concerns;

use Illuminate\Http\Request;
use Lattice\Core\Authorization;
use Lattice\Core\Contracts\Authorizable;
use Lattice\Core\Definition;

/**
 * Satisfies {@see Authorizable} for a class whose gate is entirely the `can`
 * and `on` declared on its attribute — {@see Authorization} composes the two,
 * and this side has nothing to add.
 *
 * {@see Definition} already defaults this way; the trait is for
 * everything else that implements the contract, so declaring a gate does not
 * also mean writing a `return true` by hand.
 */
trait AuthorizesByDeclaration
{
    public function authorize(Request $request): bool
    {
        return true;
    }
}
