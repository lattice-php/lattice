<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Actions\ActionRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionController
{
    public function __construct(private readonly ActionRegistry $actions) {}

    public function __invoke(Request $request, string $action): JsonResponse
    {
        return response()->json(
            $this->actions->resolve($action)->handle($request)->toArray(),
        );
    }
}
