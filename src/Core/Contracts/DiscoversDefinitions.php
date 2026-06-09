<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Contracts;

use Bambamboole\Lattice\Core\DefinitionRegistry;

interface DiscoversDefinitions
{
    /**
     * @param  array<int, DefinitionRegistry<*>>  $registries
     * @return array<string, array<int, class-string>>
     */
    public function discover(string $path, string $namespace, array $registries): array;
}
