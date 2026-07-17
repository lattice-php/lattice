<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

trait HandlesFormSubRequests
{
    /**
     * Dispatch the form sub-requests made against a form or action endpoint —
     * lazy schema fetch (actions only), signed uploads, option search, field
     * resolution — returning null when the request is the submission itself.
     */
    protected function formSubRequest(Request $request, FormDefinition|InteractsWithForm $definition): ?Response
    {
        if ($definition instanceof InteractsWithForm && $request->boolean('_form')) {
            return new JsonResponse($definition->resolveFormSchema($request));
        }

        if ($request->filled('_upload')) {
            return new JsonResponse($definition->signUpload($request));
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
