<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

use Lattice\Core\Authorization;

/**
 * Implemented by whatever a `can`+`on` pair can gate — a definition, a page —
 * so {@see Authorization} resolves the declared `on` context key
 * into the object passed to `Gate::check()` without knowing whether it is
 * reading sealed context or a route parameter.
 */
interface ResolvesGateSubject
{
    /**
     * Resolves the value under the given key into its gate subject, or null
     * when the key is absent or its resolver yields nothing. Authorization
     * treats null as "no subject" and denies rather than falling back to a
     * subject-less check.
     */
    public function gateSubject(string $key): ?object;
}
