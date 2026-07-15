<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Contracts\InteractsWithForm;
use Symfony\Component\HttpFoundation\Response;

trait HandlesFormSubRequests
{
    /**
     * Dispatch the sub-requests an embedded action form makes against the action
     * endpoint — lazy schema fetch, option search, field resolution — returning
     * null when the request is the action invocation itself.
     */
    protected function formSubRequest(Request $request, InteractsWithForm $definition): ?Response
    {
        if ($request->boolean('_form')) {
            return new JsonResponse($definition->resolveFormSchema($request));
        }

        if ($request->filled('_search')) {
            return new JsonResponse($definition->searchOptions($request));
        }

        if ($request->boolean('_resolve')) {
            return new JsonResponse($definition->resolveFields($request));
        }

        return null;
    }
}
