<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations;

use Lattice\Lattice\Attributes\AsIntegration;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<IntegrationDefinition>
 */
final class IntegrationRegistry extends DefinitionRegistry
{
    /**
     * @return class-string<IntegrationDefinition>
     */
    protected function definitionClass(): string
    {
        return IntegrationDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsIntegration::class;
    }

    protected function name(): string
    {
        return 'integration';
    }

    public function group(): string
    {
        return 'integrations';
    }

    public function tokenEndpointFor(string $key): string
    {
        return $this->endpointFor($key);
    }
}
