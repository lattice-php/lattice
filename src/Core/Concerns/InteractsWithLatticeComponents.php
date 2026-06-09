<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Concerns;

use Bambamboole\Lattice\Contracts\DefinitionRegistry;
use Bambamboole\Lattice\Contracts\SignsComponentReferences;
use Bambamboole\Lattice\Core\Definition;
use Bambamboole\Lattice\Exceptions\UnknownLatticeComponent;
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
        SignsComponentReferences $references,
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
