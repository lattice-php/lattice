<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Inertia\Response;

interface PageContract extends Authorizable
{
    /**
     * @param  array<int, mixed>  $parameters
     */
    public function callAction(string $method, array $parameters): Response;
}
