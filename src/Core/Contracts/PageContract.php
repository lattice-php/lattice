<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Inertia\Response;

interface PageContract extends Authorizable
{
    /**
     * @param  array<int, mixed>  $parameters
     */
    public function callAction(string $method, array $parameters): Response;
}
