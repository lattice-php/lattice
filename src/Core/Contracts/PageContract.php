<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Illuminate\Http\Request;

/**
 * The Core-layer marker for a page, so Core can type-hint and discover pages
 * without importing the Http-layer `Page` class. Keep this file free of any
 * Http-namespace reference — Pint's fully_qualified_strict_types fixer turns a
 * docblock FQCN into a real import and reintroduces the dependency.
 */
interface PageContract
{
    public function authorize(Request $request): bool;
}
