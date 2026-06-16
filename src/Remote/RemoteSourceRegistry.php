<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote;

use Illuminate\Contracts\Container\Container;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;

/**
 * @extends DefinitionRegistry<RemoteSourceDefinition>
 */
final class RemoteSourceRegistry extends DefinitionRegistry
{
    /**
     * @var list<callable(string, Container): ?RemoteSourceDefinition>
     */
    private array $resolvers = [];

    /**
     * @param  callable(string, Container): ?RemoteSourceDefinition  $resolver
     */
    public function resolveUsing(callable $resolver): void
    {
        $this->resolvers[] = $resolver;
    }

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

    public function resolve(string $key): RemoteSourceDefinition
    {
        $definitions = $this->definitions();

        if (array_key_exists($key, $definitions)) {
            return $this->makeSource($definitions[$key], $key);
        }

        foreach ($this->resolvers as $resolver) {
            $definition = $resolver($key, $this->container);

            if ($definition instanceof RemoteSourceDefinition) {
                return $definition->withSourceKey($key);
            }
        }

        throw new UnknownComponent($this->name(), $key);
    }

    /**
     * @param  class-string<RemoteSourceDefinition>  $definition
     */
    public function keyForDefinition(string $definition): string
    {
        return $this->registeredKeyFor($definition);
    }

    /**
     * @param  class-string<RemoteSourceDefinition>  $definition
     */
    private function makeSource(string $definition, string $key): RemoteSourceDefinition
    {
        /** @var RemoteSourceDefinition $source */
        $source = $this->make($definition);

        return $source->withSourceKey($key);
    }
}
