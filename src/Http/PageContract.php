<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Inertia\Response;
use Lattice\Lattice\Core\Contracts\Authorizable;

interface PageContract extends Authorizable
{
    /**
     * @param  array<int, mixed>  $parameters
     */
    public function callAction(string $method, array $parameters): Response;
}
