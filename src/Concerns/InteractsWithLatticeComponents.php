<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Concerns;

use Bambamboole\Lattice\Definition;
use Bambamboole\Lattice\DefinitionRegistry;
use Bambamboole\Lattice\Exceptions\UnknownLatticeComponent;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Illuminate\Http\Request;

trait InteractsWithLatticeComponents
{
    /**
     * @template TDefinition of Definition
     *
     * @param  DefinitionRegistry<TDefinition>  $registry
     * @return array{0: Request, 1: TDefinition}
     */
    protected function authorizeComponent(
        Request $request,
        ComponentReferenceSigner $references,
        DefinitionRegistry $registry,
        string $type,
        string $key,
    ): array {
        $request = $references->mergeTrustedContext($request, $type, $key);

        try {
            $definition = $registry->resolve($key);
        } catch (UnknownLatticeComponent) {
            abort(404);
        }

        abort_unless($definition->authorize($request), 403);

        return [$request, $definition];
    }
}
