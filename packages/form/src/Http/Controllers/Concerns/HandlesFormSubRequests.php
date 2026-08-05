<?php
declare(strict_types=1);

namespace Lattice\Form\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Http\SubRequestType;
use Lattice\Form\Contracts\InteractsWithForm;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

trait HandlesFormSubRequests
{
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
