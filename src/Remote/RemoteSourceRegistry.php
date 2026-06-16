<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<RemoteSourceDefinition>
 */
final class RemoteSourceRegistry extends DefinitionRegistry
{
    /**
     * @return class-string<RemoteSourceDefinition>
     */
    protected function definitionClass(): string
    {
        return RemoteSourceDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsRemoteSource::class;
    }

    protected function name(): string
    {
        return 'source';
    }

    public function group(): string
    {
        return 'remote-sources';
    }

    /**
     * @param  class-string<RemoteSourceDefinition>  $definition
     */
    public function keyForDefinition(string $definition): string
    {
        return $this->registeredKeyFor($definition);
    }
}
