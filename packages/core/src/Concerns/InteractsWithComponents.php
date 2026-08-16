<?php
declare(strict_types=1);

namespace Lattice\Core\Concerns;

use Illuminate\Http\Request;
use Lattice\Core\Authorization;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Definition;
use Lattice\Core\DefinitionRegistry;
use Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Core\Services\ContextScope;

trait InteractsWithComponents
{
    /**
     * @template TDefinition of Definition
     *
     * @param  DefinitionRegistry<TDefinition>  $registry
     * @return array{0: Request, 1: TDefinition, 2: array<string, mixed>}
     */
    protected function authorizeComponent(
        Request $request,
        SignsComponentReferences $references,
        DefinitionRegistry $registry,
        string $type,
        string $key,
    ): array {
        $context = $references->trustedContext($request, $type, $key);

        try {
            $definition = $registry->resolve($key)->withContext($context);
        } catch (UnknownComponent) {
            abort(404);
        }

        Authorization::ensure($definition, $request);

        app(ContextScope::class)->activate($context);

        return [$request, $definition, $context];
    }
}
