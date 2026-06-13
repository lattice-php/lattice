<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\DefinitionRegistry;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\Exceptions\UnknownLatticeComponent;

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
