<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Lattice\Lattice\Core\DefinitionRegistry;

interface DiscoversDefinitions
{
    /**
     * @param  array<int, DefinitionRegistry<*>>  $registries
     * @return array<string, array<int, class-string>>
     */
    public function discover(string $path, string $namespace, array $registries): array;
}
