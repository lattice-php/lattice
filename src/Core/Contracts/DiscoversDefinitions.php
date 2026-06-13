<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

interface DiscoversDefinitions
{
    /**
     * @param  array<int, Discoverable>  $registries
     * @return array<string, array<int, class-string>>
     */
    public function discover(string $path, string $namespace, array $registries): array;
}
