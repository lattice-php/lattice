<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Contracts;

use Bambamboole\Lattice\Core\Definition;

/**
 * @template TDefinition of Definition
 */
interface DefinitionRegistry
{
    /**
     * @param  class-string<TDefinition>|array<int, class-string<TDefinition>>  $definitions
     */
    public function register(string|array $definitions): void;

    /**
     * @return TDefinition
     */
    public function resolve(string $key): Definition;

    public function endpointFor(string $key): string;
}
