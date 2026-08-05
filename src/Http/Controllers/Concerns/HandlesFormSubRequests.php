<?php
declare(strict_types=1);

namespace Lattice\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Http\SubRequestType;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

trait HandlesFormSubRequests
{
    /**
     * Dispatch the sub-requests made against a form or action endpoint —
     * lazy schema fetch (actions only), signed uploads, option search, field
     * resolution — returning null when the request is the submission itself.
     */
    protected function formSubRequest(Request $request, FormDefinition|InteractsWithForm $definition): ?Response
    {
        $sub = SubRequest::from($request);

        if (! $sub instanceof SubRequest) {
            return null;
        }

        return match ($sub->type) {
            SubRequestType::Schema => $definition instanceof InteractsWithForm
                ? new JsonResponse($definition->resolveFormSchema($request))
                : null,
            SubRequestType::Upload => new JsonResponse($definition->signUpload($request, $sub)),
            SubRequestType::Search => new JsonResponse($definition->searchOptions($request, $sub)),
            SubRequestType::Resolve => new JsonResponse($definition->resolveFields($request)),
        };
    }
}
