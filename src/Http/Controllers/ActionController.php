<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Actions\ActionRegistry;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionController
{
    public function __construct(
        private readonly ActionRegistry $actions,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $action): JsonResponse
    {
        $request = $this->references->mergeTrustedContext($request, 'action', $action);
        $definition = $this->actions->resolve($action);

        abort_unless($definition->authorize($request), 403);

        return response()->json(
            $definition->handle($request)->toArray(),
        );
    }
}
