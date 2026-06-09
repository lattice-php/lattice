<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

interface DiscoversDefinitions
{
    /**
     * @return array<string, array<int, class-string>>
     */
    public function discover(string $path, string $namespace): array;
}
