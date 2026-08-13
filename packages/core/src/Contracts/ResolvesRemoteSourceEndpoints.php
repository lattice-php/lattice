<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

interface ResolvesRemoteSourceEndpoints
{
    public function endpointFor(string $source): string;
}
